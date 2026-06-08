"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, Check, Copy, FolderInput, Inbox, Link2, Plug, PlugZap, RefreshCw, UserPlus, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import {
  clientIntakeApi,
  connectedSourcesApi,
  emailIntakeApi,
  workspaceApi,
  type ClientUploadLink,
  type ClientUploadSubmission,
  type ConnectedSource,
  type ConnectedSourceProvider,
  type EmailIntakeAddress,
  type EmailIntakeMessage,
  type WorkspaceMember,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

const workspacePrimaryButton =
  "border-2 !border-[var(--brand-brown-fg)] !bg-[var(--brand-brown-fg)] !text-white !shadow-none hover:!border-black hover:!bg-white hover:!text-black hover:underline hover:decoration-1 hover:underline-offset-4"

const workspaceWarmPanel = "border-[var(--workspace-popout-border)] bg-[var(--workspace-popout-bg)]"

function formatReceivedAt(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function formatExpiry(value: string) {
  const d = new Date(value)
  const now = new Date()
  if (d < now) return "Expired"
  const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return `${days}d left`
}

function submissionTone(sub: ClientUploadSubmission): "success" | "processing" | "info" | "error" | "neutral" {
  const state = sub.job_status || sub.status
  if (state === "completed" || state === "partially_completed") return "success"
  if (state === "processing") return "processing"
  if (state === "queued" || state === "received") return "info"
  if (state === "rejected" || state === "failed") return "error"
  return "neutral"
}

const SOURCE_LABEL: Record<"direct_upload" | "email" | "client_link" | "google_drive" | "dropbox", string> = {
  direct_upload: "Direct upload",
  email: "Email",
  client_link: "Client link",
  google_drive: "Google Drive",
  dropbox: "Dropbox",
}

const SOURCE_TINT: Record<"direct_upload" | "email" | "client_link" | "google_drive" | "dropbox", string> = {
  direct_upload: "border-border bg-muted/50 text-foreground",
  email: "border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200",
  client_link: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  google_drive: "border-border bg-muted/50 text-foreground",
  dropbox: "border-border bg-muted/50 text-foreground",
}

function SourceBadge({ kind }: { kind: keyof typeof SOURCE_LABEL }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold", SOURCE_TINT[kind])}>
      {SOURCE_LABEL[kind]}
    </span>
  )
}

function messageState(message: EmailIntakeMessage) {
  const state = message.job_status || message.status
  if (state === "completed" || state === "partially_completed") return "Ready"
  if (state === "processing") return "Processing"
  if (state === "queued" || state === "received") return "Queued"
  if (state === "rejected") return "Rejected"
  return "Failed"
}

export default function EmailInboxPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspaces(user)
  const [address, setAddress] = useState<EmailIntakeAddress | null>(null)
  const [messages, setMessages] = useState<EmailIntakeMessage[]>([])
  const [links, setLinks] = useState<ClientUploadLink[]>([])
  const [submissions, setSubmissions] = useState<ClientUploadSubmission[]>([])
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [connectedSources, setConnectedSources] = useState<ConnectedSource[]>([])
  const [providersConfigured, setProvidersConfigured] = useState<Record<ConnectedSourceProvider, boolean>>({
    google_drive: false,
    dropbox: false,
  })
  const [connectingProvider, setConnectingProvider] = useState<ConnectedSourceProvider | null>(null)
  const [folderDraft, setFolderDraft] = useState<{ id: string; value: string } | null>(null)
  const searchParams = useSearchParams()
  const [newUploadUrl, setNewUploadUrl] = useState<string | null>(null)
  const [linkLabel, setLinkLabel] = useState("Client documents")
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Finbox")
    }
  }, [authLoading, router, user])

  const loadInbox = useCallback(async () => {
    if (!user || !activeWorkspace) return
    setLoading(true)
    setLoadError(null)
    try {
      const [received, clientUploads] = await Promise.all([
        emailIntakeApi.listMessages(activeWorkspace.id),
        clientIntakeApi.listSubmissions(activeWorkspace.id),
      ])
      setMessages(received.messages)
      setSubmissions(clientUploads.submissions)
      if (activeWorkspace.role === "owner") {
        const [intake, currentLinks, currentMembers, sources] = await Promise.all([
          emailIntakeApi.getAddress(activeWorkspace.id),
          clientIntakeApi.listLinks(activeWorkspace.id),
          workspaceApi.members(activeWorkspace.id),
          connectedSourcesApi.list(activeWorkspace.id).catch(() => ({
            sources: [] as ConnectedSource[],
            total: 0,
            providers_configured: { google_drive: false, dropbox: false } as Record<ConnectedSourceProvider, boolean>,
          })),
        ])
        setAddress(intake)
        setLinks(currentLinks.links)
        setMembers(currentMembers.members)
        setConnectedSources(sources.sources)
        setProvidersConfigured(sources.providers_configured)
      } else {
        setAddress(null)
        setLinks([])
        setMembers([])
        setConnectedSources([])
      }
    } catch {
      setLoadError("Inbox is unavailable right now. Refresh after your workspace is ready.")
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace, user])

  useEffect(() => {
    void loadInbox()
  }, [loadInbox])

  const importCount = useMemo(() => messages.reduce((count, message) => (
    count + message.accepted_attachment_count
  ), 0), [messages])

  const copyAddress = async () => {
    if (!address?.address) return
    await navigator.clipboard.writeText(address.address)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  const createClientLink = async () => {
    if (!activeWorkspace) return
    setActionBusy("link")
    try {
      const result = await clientIntakeApi.createLink(activeWorkspace.id, {
        label: linkLabel.trim() || "Client documents",
        expires_in_hours: 168,
        max_submissions: 25,
      })
      setNewUploadUrl(result.upload_url)
      setLinks(current => [result.link, ...current])
    } catch {
      setLoadError("Could not create a client upload link.")
    } finally {
      setActionBusy(null)
    }
  }

  const revokeClientLink = async (linkId: string) => {
    if (!activeWorkspace) return
    setActionBusy(linkId)
    try {
      await clientIntakeApi.revokeLink(activeWorkspace.id, linkId)
      setLinks(current => current.map(link => link.id === linkId ? { ...link, enabled: false } : link))
    } finally {
      setActionBusy(null)
    }
  }

  const inviteReviewer = async () => {
    if (!activeWorkspace || !reviewerEmail.trim()) return
    setActionBusy("reviewer")
    try {
      const member = await workspaceApi.inviteReviewer(activeWorkspace.id, reviewerEmail.trim())
      setMembers(current => [...current.filter(item => item.id !== member.id), member])
      setReviewerEmail("")
    } catch {
      setLoadError("Could not add this reviewer.")
    } finally {
      setActionBusy(null)
    }
  }

  const revokeReviewer = async (membershipId: string) => {
    if (!activeWorkspace) return
    setActionBusy(membershipId)
    try {
      await workspaceApi.revokeReviewer(activeWorkspace.id, membershipId)
      setMembers(current => current.map(member => member.id === membershipId ? { ...member, status: "revoked" } : member))
    } finally {
      setActionBusy(null)
    }
  }

  // P6 — show a one-off toast when the OAuth callback hands the user back here.
  useEffect(() => {
    const connected = searchParams.get("connected")
    if (!connected) return
    const statusParam = searchParams.get("status")
    const reason = searchParams.get("reason")
    if (statusParam === "connected") {
      toast.success(
        connected === "google_drive"
          ? "Google Drive connected. Pick a folder to watch."
          : connected === "dropbox"
            ? "Dropbox connected. Pick a folder to watch."
            : "Connection complete.",
      )
      void loadInbox()
    } else if (connected === "error") {
      toast.error(reason ? `Could not connect: ${reason.replace(/_/g, " ")}` : "OAuth connection failed.")
    }
    // Clear the query params so a refresh doesn't replay the toast.
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.delete("connected")
      url.searchParams.delete("status")
      url.searchParams.delete("reason")
      window.history.replaceState({}, "", url.toString())
    }
  }, [searchParams, loadInbox])

  const startConnectProvider = async (provider: ConnectedSourceProvider) => {
    if (!activeWorkspace) return
    if (!providersConfigured[provider]) {
      toast.error(
        provider === "google_drive"
          ? "Google Drive OAuth is not configured on this deployment yet."
          : "Dropbox OAuth is not configured on this deployment yet.",
      )
      return
    }
    setConnectingProvider(provider)
    try {
      const redirect = typeof window !== "undefined" ? window.location.origin + "/dashboard/inbox" : undefined
      const result = await connectedSourcesApi.startConnect(activeWorkspace.id, provider, redirect)
      window.location.href = result.authorization_url
    } catch (error: any) {
      toast.error(error?.detail || "Could not start the connection.")
    } finally {
      setConnectingProvider(null)
    }
  }

  const disconnectSource = async (sourceId: string) => {
    if (!window.confirm("Disconnect this folder watch? Files already pulled stay in the inbox.")) return
    setActionBusy(sourceId)
    try {
      await connectedSourcesApi.disconnect(sourceId)
      setConnectedSources(current => current.map(source => source.id === sourceId ? { ...source, status: "disconnected" } : source))
      toast.success("Disconnected.")
    } catch (error: any) {
      toast.error(error?.detail || "Could not disconnect.")
    } finally {
      setActionBusy(null)
    }
  }

  const triggerSync = async (sourceId: string) => {
    setActionBusy(sourceId)
    try {
      const response = await connectedSourcesApi.triggerSync(sourceId)
      setConnectedSources(current => current.map(source => source.id === sourceId ? response.source : source))
      toast.message("Sync requested.")
    } catch (error: any) {
      toast.error(error?.detail || "Could not run a sync now.")
    } finally {
      setActionBusy(null)
    }
  }

  const saveWatchedFolder = async (sourceId: string) => {
    if (!folderDraft || folderDraft.id !== sourceId) return
    setActionBusy(sourceId)
    try {
      const response = await connectedSourcesApi.updateFolder(sourceId, {
        watched_folder: folderDraft.value.trim(),
      })
      setConnectedSources(current => current.map(source => source.id === sourceId ? response.source : source))
      setFolderDraft(null)
      toast.success("Watched folder updated.")
    } catch (error: any) {
      toast.error(error?.detail || "Could not save the folder.")
    } finally {
      setActionBusy(null)
    }
  }

  if (authLoading || workspaceLoading || !user) {
    return <DashboardRouteLoader label="Loading inbox" />
  }

  return (
    <DashboardShell activeItem="inbox" title="Inbox" user={user} showBack={false}>
      <div className="max-w-6xl space-y-5">
        <PageHeader
          title="Inbox"
          actions={
            <InlineAction onClick={() => void loadInbox()} disabled={loading}>
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </InlineAction>
          }
        />

        {/* Management cards — stack on mobile, side-by-side on lg */}
        {activeWorkspace?.role === "owner" ? (
          <div className="grid gap-4 lg:grid-cols-2">

            {/* Client upload links */}
            <Card className="!shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Image src="/icons/share.png" alt="" width={20} height={20} className="object-contain opacity-85" loading="lazy" />
                  <p className="text-sm font-semibold text-foreground">Client upload links</p>
                </div>

                <div className="mt-4 flex gap-3">
                  <Input value={linkLabel} onChange={event => setLinkLabel(event.target.value)} placeholder="Client documents" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="glossy" onClick={() => void createClientLink()} disabled={actionBusy === "link"} className={workspacePrimaryButton}>
                        <Link2 className="size-4" />
                        Create
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Creates a 7-day client upload link.</TooltipContent>
                  </Tooltip>
                </div>

                {newUploadUrl ? (
                  <div className="mt-3 space-y-2">
                    <div className={cn("flex items-center gap-3 rounded-lg border px-3 py-2", workspaceWarmPanel)}>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Upload</span>
                      <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{newUploadUrl}</p>
                      <InlineAction className="shrink-0" onClick={() => void navigator.clipboard.writeText(newUploadUrl)}>Copy</InlineAction>
                    </div>
                    <div className={cn("flex items-center gap-3 rounded-lg border px-3 py-2", workspaceWarmPanel)}>
                      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</span>
                      <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{newUploadUrl.replace("/upload/", "/status/")}</p>
                      <InlineAction className="shrink-0" onClick={() => void navigator.clipboard.writeText(newUploadUrl.replace("/upload/", "/status/"))}>Copy</InlineAction>
                    </div>
                  </div>
                ) : null}

                {links.length > 0 ? (
                  <>
                    {/* Desktop table */}
                    <div className="mt-3 hidden overflow-hidden rounded-lg border border-border sm:block">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border bg-muted/40">
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Label</th>
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Submissions</th>
                            <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Expires</th>
                            <th className="w-16 px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {links.slice(0, 5).map(link => (
                            <tr key={link.id} className="border-b border-border/50 last:border-0 hover:bg-accent/40">
                              <td className="px-3 py-2.5 font-medium text-foreground">{link.label}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">{link.submission_count}/{link.max_submissions}</td>
                              <td className="px-3 py-2.5 text-muted-foreground">{formatExpiry(link.expires_at)}</td>
                              <td className="px-3 py-2.5">
                                {link.enabled ? (
                                  <InlineAction tone="danger" className="text-xs" onClick={() => void revokeClientLink(link.id)} disabled={actionBusy === link.id}>
                                    Revoke
                                  </InlineAction>
                                ) : (
                                  <span className="text-xs font-medium text-foreground">Revoked</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile cards */}
                    <div className="mt-3 space-y-2 sm:hidden">
                      {links.slice(0, 5).map(link => (
                        <div key={link.id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">{link.label}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {link.submission_count}/{link.max_submissions} submissions · {formatExpiry(link.expires_at)}
                              {!link.enabled ? " · Revoked" : ""}
                            </p>
                          </div>
                          {link.enabled ? (
                            <InlineAction tone="danger" className="shrink-0 text-xs" onClick={() => void revokeClientLink(link.id)} disabled={actionBusy === link.id}>
                              Revoke
                            </InlineAction>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Reviewers */}
            <Card className="!shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Image src="/icons/reviewer.png" alt="" width={20} height={20} className="object-contain opacity-85" loading="lazy" />
                  <p className="text-sm font-semibold text-foreground">Reviewers</p>
                </div>

                <div className="mt-4 flex gap-3">
                  <Input type="email" value={reviewerEmail} onChange={event => setReviewerEmail(event.target.value)} placeholder="reviewer@firm.com" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="glossy" onClick={() => void inviteReviewer()} disabled={actionBusy === "reviewer"} className={workspacePrimaryButton}>
                        <UserPlus className="size-4" />
                        Add
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Adds reviewer edit and export access.</TooltipContent>
                  </Tooltip>
                </div>

                <div className="mt-3 space-y-2">
                  {members.filter(member => member.role === "reviewer").map(member => (
                    <div key={member.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.member_email}</p>
                        <p className="mt-0.5 text-xs capitalize text-muted-foreground">{member.status}</p>
                      </div>
                      {member.status !== "revoked" ? (
                        <InlineAction tone="danger" className="text-xs" onClick={() => void revokeReviewer(member.id)} disabled={actionBusy === member.id}>
                          Remove
                        </InlineAction>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Email address card */}
        {activeWorkspace?.role === "owner" ? (
          <Card className="!shadow-none">
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Forward documents to</p>
                  <p className="mt-2 break-all font-mono text-sm font-medium text-foreground">
                    {address?.address || "Provisioning address…"}
                  </p>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InlineAction onClick={() => void copyAddress()} disabled={!address} className="shrink-0">
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "Copied!" : "Copy address"}
                    </InlineAction>
                  </TooltipTrigger>
                  <TooltipContent side="top">Copy the forwarding address.</TooltipContent>
                </Tooltip>
              </div>
              {loadError ? (
                <p className="mt-3 text-sm text-destructive">{loadError}</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {/* P6 — Connected sources (Google Drive / Dropbox watch folders) */}
        {activeWorkspace?.role === "owner" ? (
          <Card className="!shadow-none">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-foreground">Connected sources</p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(["google_drive", "dropbox"] as ConnectedSourceProvider[]).map((provider) => {
                  const source = connectedSources.find(item => item.provider === provider && item.status !== "disconnected")
                  const configured = providersConfigured[provider]
                  const label = provider === "google_drive" ? "Google Drive" : "Dropbox"
                  return (
                    <div key={provider} className={cn("rounded-xl border p-4", workspaceWarmPanel)}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex size-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            <FolderInput className="size-4.5" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{label}</p>
                            {source?.account_email ? (
                              <p className="truncate text-xs font-normal text-foreground">{source.account_email}</p>
                            ) : (
                              <p className="text-xs font-normal text-foreground">
                                {configured ? "Not connected" : "OAuth not configured"}
                              </p>
                            )}
                          </div>
                        </div>
                        {source ? (
                          <StatusBadge tone={source.status === "connected" ? "success" : source.status === "error" ? "error" : "neutral"}>
                            {source.status}
                          </StatusBadge>
                        ) : null}
                      </div>

                      {source && source.status === "connected" ? (
                        <>
                          <div className="mt-3 space-y-1.5">
                            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Watched folder</p>
                            {folderDraft?.id === source.id ? (
                              <div className="flex items-center gap-3">
                                <Input
                                  value={folderDraft.value}
                                  onChange={(event) => setFolderDraft({ id: source.id, value: event.target.value })}
                                  placeholder={provider === "google_drive" ? "AxLiner intake" : "/AxLiner intake"}
                                  className="h-9"
                                />
                                <InlineAction onClick={() => void saveWatchedFolder(source.id)} disabled={actionBusy === source.id} className="shrink-0">
                                  Save
                                </InlineAction>
                                <InlineAction onClick={() => setFolderDraft(null)} className="shrink-0" aria-label="Cancel">
                                  <X className="size-3.5" />
                                </InlineAction>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <p className="min-w-0 truncate text-sm font-medium text-foreground">
                                  {source.watched_folder || <span className="text-foreground/70">No folder set</span>}
                                </p>
                                <InlineAction className="text-xs" onClick={() => setFolderDraft({ id: source.id, value: source.watched_folder || "" })}>
                                  Edit
                                </InlineAction>
                              </div>
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-foreground">
                            <span>
                              Last sync: {source.last_synced_at ? formatReceivedAt(source.last_synced_at) : "never"}
                            </span>
                            <div className="flex items-center gap-4">
                              <InlineAction className="text-xs [&_svg]:size-3" onClick={() => void triggerSync(source.id)} disabled={actionBusy === source.id}>
                                <RefreshCw className={cn("size-3", actionBusy === source.id && "animate-spin")} />
                                Sync now
                              </InlineAction>
                              <InlineAction tone="danger" className="text-xs" onClick={() => void disconnectSource(source.id)} disabled={actionBusy === source.id}>
                                Disconnect
                              </InlineAction>
                            </div>
                          </div>
                          {source.last_sync_status === "pending_implementation" ? (
                            <p className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-[11px] leading-4 text-amber-900">
                              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
                              Folder polling is queued.
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <div className="mt-3">
                          <Button
                            variant="surface"
                            size="sm"
                            className="w-full"
                            onClick={() => void startConnectProvider(provider)}
                            disabled={!configured || connectingProvider === provider}
                          >
                            {connectingProvider === provider ? <RefreshCw className="size-3.5 animate-spin" /> : configured ? <PlugZap className="size-3.5" /> : <Plug className="size-3.5" />}
                            {configured ? `Connect ${label}` : "Setup pending"}
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Client submissions */}
        <div className="flex items-end justify-between gap-3 border-b border-border/60 pb-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">Intake</p>
            <h2 className="mt-1 text-[19px] font-bold tracking-tight text-foreground">Client submissions</h2>
          </div>
          <Badge variant="outline">{submissions.reduce((count, submission) => count + submission.file_count, 0)} files</Badge>
        </div>

        <Card className="overflow-hidden !shadow-none">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-4"><EmptyState compact icon={<RefreshCw className="animate-spin h-5 w-5" />} title="Loading submissions" /></div>
            ) : submissions.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={<Inbox />}
                  illustration="/symbols/firstsight-inbox-empty.png"
                  illustrationSize={260}
                  eyebrow="Intake"
                  title="No submissions yet"
                />
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Filename</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Source</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Files</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-4 py-2.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(submission => {
                        const filename = submission.documents[0]?.original_filename || `${submission.file_count} submitted files`
                        return (
                          <tr key={submission.id} className="border-b border-border/50 last:border-0 hover:bg-accent/40">
                            <td className="max-w-[220px] truncate px-5 py-3 font-medium text-foreground">{filename}</td>
                            <td className="px-4 py-3">
                              <SourceBadge kind="client_link" />
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">{formatReceivedAt(submission.created_at)}</td>
                            <td className="px-4 py-3 tabular-nums text-muted-foreground">{submission.file_count}</td>
                            <td className="px-4 py-3">
                              <StatusBadge tone={submissionTone(submission)}>
                                {(submission.job_status || submission.status).replace(/_/g, " ")}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-3">
                              {submission.job_id ? (
                                <InlineAction asChild>
                                  <Link href={`/dashboard/client?job_id=${encodeURIComponent(submission.job_id)}`}>Review</Link>
                                </InlineAction>
                              ) : null}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card stack */}
                <div className="divide-y divide-border sm:hidden">
                  {submissions.map(submission => {
                    const filename = submission.documents[0]?.original_filename || `${submission.file_count} submitted files`
                    return (
                      <div key={submission.id} className="p-5">
                        <p className="truncate text-sm font-medium text-foreground">{filename}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatReceivedAt(submission.created_at)}</p>
                        <div className="mt-2.5 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <StatusBadge tone={submissionTone(submission)}>
                              {(submission.job_status || submission.status).replace(/_/g, " ")}
                            </StatusBadge>
                            <span className="text-xs text-muted-foreground">{submission.file_count} file{submission.file_count !== 1 ? "s" : ""}</span>
                          </div>
                          {submission.job_id ? (
                            <InlineAction asChild>
                              <Link href={`/dashboard/client?job_id=${encodeURIComponent(submission.job_id)}`}>Review</Link>
                            </InlineAction>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Imported documents (email messages) */}
        <div className="flex items-end justify-between gap-3 border-b border-border/60 pb-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">Email</p>
            <h2 className="mt-1 text-[19px] font-bold tracking-tight text-foreground">Imported documents</h2>
          </div>
          <Badge variant="outline">{importCount} files</Badge>
        </div>

        <Card className="overflow-hidden !shadow-none">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-4"><EmptyState compact icon={<RefreshCw className="animate-spin h-5 w-5" />} title="Loading imports" /></div>
            ) : messages.length === 0 ? (
              <div className="py-6">
                <EmptyState
                  icon={<Inbox />}
                  illustration="/symbols/success-inbox-zero.png"
                  illustrationSize={260}
                  eyebrow="Email"
                  title="Inbox zero"
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {messages.map((message) => {
                  const state = messageState(message)
                  const documentNames = message.documents.map(document => document.original_filename).join(", ")
                  const tone = state === "Ready" ? "success" : (state === "Failed" || state === "Rejected") ? "error" : state === "Processing" ? "processing" : "neutral"
                  return (
                    <div key={message.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(11rem,1.1fr)_minmax(11rem,1.5fr)_8rem_10rem_7rem_auto] lg:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{message.sender || "Unknown sender"}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{message.source_email_reference}</p>
                      </div>
                      <p className="truncate text-sm text-foreground">
                        {documentNames || `${message.attachment_count} attachment${message.attachment_count === 1 ? "" : "s"}`}
                      </p>
                      <SourceBadge kind="email" />
                      <p className="text-sm text-muted-foreground">{formatReceivedAt(message.received_at)}</p>
                      <StatusBadge tone={tone}>{state}</StatusBadge>
                      {message.job_id ? (
                        <InlineAction asChild>
                          <Link href={`/dashboard/client?job_id=${encodeURIComponent(message.job_id)}`}>Review</Link>
                        </InlineAction>
                      ) : (
                        <span className="text-xs font-medium text-foreground">
                          {message.rejected_attachments.length ? "Not imported" : "Pending"}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { AtSign, Check, Clock, Cloud, Copy, FolderInput, FolderSync, Inbox, Link2, Mail, Mailbox, Plug, PlugZap, RefreshCw, Users, X } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { Field } from "@/components/dashboard/Field"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { InlineAction } from "@/components/ui/inline-action"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { useMotionTokens } from "@/lib/motion"
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

// The shared ui Table cells/rows, wrapped so the existing stagger /
// AnimatePresence / layout animations still play on every row.
const MotionTableRow = motion.create(TableRow)
const MotionTableCell = motion.create(TableCell)
const cell = "px-4 py-3"

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
  email: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
  client_link: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
  google_drive: "border-border bg-muted/50 text-foreground",
  dropbox: "border-border bg-muted/50 text-foreground",
}

function SourceBadge({ kind }: { kind: keyof typeof SOURCE_LABEL }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", SOURCE_TINT[kind])}>
      {SOURCE_LABEL[kind]}
    </span>
  )
}

function messageState(message: EmailIntakeMessage) {
  const state = message.job_status || message.status
  if (state === "completed" || state === "partially_completed") return "Ready"
  if (state === "processing") return "Reading"
  if (state === "queued" || state === "received") return "Waiting"
  if (state === "rejected") return "Rejected"
  return "Failed"
}

/**
 * Crossfades a status badge's text label whenever it changes (e.g.
 * "Processing" → "Ready") instead of an instant swap. Keyed on the value so
 * AnimatePresence runs the exit/enter on every transition. m.tFast.
 */
function BadgeValue({ value }: { value: string }) {
  const m = useMotionTokens()
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={m.tFast}
        className="inline-block"
      >
        {value}
      </motion.span>
    </AnimatePresence>
  )
}

/**
 * One mobile row treatment shared by all three lists (client links, client
 * submissions, email imports) so the small-screen layout reads as one product.
 * Title + optional meta line on the left; status/action slot on the right.
 */
function MobileRow({
  title,
  meta,
  trailing,
  children,
}: {
  title: React.ReactNode
  meta?: React.ReactNode
  trailing?: React.ReactNode
  children?: React.ReactNode
}) {
  const m = useMotionTokens()
  return (
    <motion.div layout variants={m.fadeUp} exit="exit" className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 space-y-1">
        <p className="truncate text-sm font-medium text-black">{title}</p>
        {meta ? <div className="flex flex-wrap items-center gap-2 text-xs text-black">{meta}</div> : null}
        {children}
      </div>
      {trailing ? <div className="flex shrink-0 items-center gap-3">{trailing}</div> : null}
    </motion.div>
  )
}

export default function EmailInboxPage() {
  const m = useMotionTokens()
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
  const [copiedLink, setCopiedLink] = useState<"upload" | "status" | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [disconnectDraft, setDisconnectDraft] = useState<ConnectedSource | null>(null)

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
    setActionBusy(sourceId)
    try {
      await connectedSourcesApi.disconnect(sourceId)
      setConnectedSources(current => current.map(source => source.id === sourceId ? { ...source, status: "disconnected" } : source))
      setDisconnectDraft(null)
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

  const submissionFileCount = submissions.reduce((count, submission) => count + submission.file_count, 0)

  return (
    <DashboardShell activeItem="inbox" title="Inbox" user={user} showBack={false}>
      <div className="max-w-7xl space-y-6 text-black">
        <PageHeader
          title="Inbox"
          description="Collect uploads, forwarded documents, and watched-folder imports before review."
          actions={
            <Button variant="ghost" size="sm" onClick={() => void loadInbox()} disabled={loading}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          }
        />

        {loading ? (
          <WorkspaceActivityIndicator
            title="Checking the intake inbox"
            detail="Retrieving client submissions, emailed documents, and watched-folder imports."
          />
        ) : null}

        {/* Management cards — stack on mobile, side-by-side on lg */}
        {activeWorkspace?.role === "owner" ? (
          <div className="grid gap-6 lg:grid-cols-2">

            {/* Client upload links */}
            <WorkspaceSection
              id="client-upload-links"
              icon={<Link2 />}
              title="Upload links"
              hint="Share a client-safe drop zone for a batch."
              className="shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            >
              <div className="rounded-lg border border-[var(--workspace-border)] bg-[var(--workspace-soft)] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black">Client upload portal</p>
                    <p className="mt-0.5 text-xs font-medium text-[var(--workspace-muted)]">New files land in Client submissions.</p>
                  </div>
                  <StatusBadge tone={links.length ? "success" : "neutral"}>{links.length} link{links.length === 1 ? "" : "s"}</StatusBadge>
                </div>
                <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                  <Input value={linkLabel} onChange={event => setLinkLabel(event.target.value)} placeholder="Client documents" className="flex-1" />
                  <Button variant="glossy" size="sm" onClick={() => void createClientLink()} disabled={actionBusy === "link"}>
                    <Link2 className="size-3.5" />
                    Create link
                  </Button>
                </div>
              </div>

              {newUploadUrl ? (
                <div className="mt-4 space-y-3">
                  <Field label="Upload link" icon={<Link2 />}>
                    <div className="flex items-center gap-3 rounded-md border border-[#d8dde6] bg-[#f8fafc] px-3 py-2">
                      <p className="ax-data-reference min-w-0 flex-1 truncate font-mono text-xs">{newUploadUrl}</p>
                      <InlineAction
                        className="shrink-0"
                        onClick={() => {
                          void navigator.clipboard.writeText(newUploadUrl)
                          setCopiedLink("upload")
                          window.setTimeout(() => setCopiedLink(current => (current === "upload" ? null : current)), 1600)
                        }}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={copiedLink === "upload" ? "copied" : "copy"}
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            transition={m.tFast}
                            className="inline-block"
                          >
                            {copiedLink === "upload" ? "Copied!" : "Copy"}
                          </motion.span>
                        </AnimatePresence>
                      </InlineAction>
                    </div>
                  </Field>
                  <Field label="Status link" icon={<Clock />}>
                    <div className="flex items-center gap-3 rounded-md border border-[#d8dde6] bg-[#f8fafc] px-3 py-2">
                      <p className="ax-data-reference min-w-0 flex-1 truncate font-mono text-xs">{newUploadUrl.replace("/upload/", "/status/")}</p>
                      <InlineAction
                        className="shrink-0"
                        onClick={() => {
                          void navigator.clipboard.writeText(newUploadUrl.replace("/upload/", "/status/"))
                          setCopiedLink("status")
                          window.setTimeout(() => setCopiedLink(current => (current === "status" ? null : current)), 1600)
                        }}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span
                            key={copiedLink === "status" ? "copied" : "copy"}
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.94 }}
                            transition={m.tFast}
                            className="inline-block"
                          >
                            {copiedLink === "status" ? "Copied!" : "Copy"}
                          </motion.span>
                        </AnimatePresence>
                      </InlineAction>
                    </div>
                  </Field>
                </div>
              ) : null}

              {links.length > 0 ? (
                <>
                  {/* Desktop table */}
                  <div className="mt-4 hidden overflow-hidden rounded-md border border-border sm:block">
                    <Table className="ax-table">
                      <TableHeader>
                        <TableRow className="bg-[#f3f4f6] hover:bg-[#f3f4f6]">
                          <TableHead className={cell}>Label</TableHead>
                          <TableHead className={cell}>Submissions</TableHead>
                          <TableHead className={cell}>Expires</TableHead>
                          <TableHead className="w-16 px-4 py-3" />
                        </TableRow>
                      </TableHeader>
                      <motion.tbody variants={m.staggerParent()} initial="hidden" animate="show" className="[&_tr:last-child]:border-0">
                        <AnimatePresence initial={false}>
                        {links.slice(0, 5).map(link => (
                          <MotionTableRow key={link.id} layout variants={m.fadeUp} exit="exit">
                            <MotionTableCell className={cn(cell, "font-medium text-black")}>{link.label}</MotionTableCell>
                            <MotionTableCell className={cn(cell, "tabular-nums text-black")}>{link.submission_count}/{link.max_submissions}</MotionTableCell>
                            <MotionTableCell className={cn(cell, "text-black")}>{formatExpiry(link.expires_at)}</MotionTableCell>
                            <MotionTableCell className="px-4 py-3">
                              {link.enabled ? (
                                <InlineAction tone="danger" className="text-xs" onClick={() => void revokeClientLink(link.id)} disabled={actionBusy === link.id}>
                                  Revoke
                                </InlineAction>
                              ) : (
                                <StatusBadge tone="neutral">Revoked</StatusBadge>
                              )}
                            </MotionTableCell>
                          </MotionTableRow>
                        ))}
                        </AnimatePresence>
                      </motion.tbody>
                    </Table>
                  </div>

                  {/* Mobile cards */}
                  <motion.div className="mt-4 space-y-3 sm:hidden" variants={m.staggerParent()} initial="hidden" animate="show">
                    <AnimatePresence initial={false}>
                    {links.slice(0, 5).map(link => (
                      <div key={link.id} className="rounded-md border border-border bg-white">
                        <MobileRow
                          title={link.label}
                          meta={
                            <>
                              <span className="tabular-nums">{link.submission_count}/{link.max_submissions}</span>
                              <span>{formatExpiry(link.expires_at)}</span>
                              {!link.enabled ? <StatusBadge tone="neutral">Revoked</StatusBadge> : null}
                            </>
                          }
                          trailing={
                            link.enabled ? (
                              <InlineAction tone="danger" className="text-xs" onClick={() => void revokeClientLink(link.id)} disabled={actionBusy === link.id}>
                                Revoke
                              </InlineAction>
                            ) : null
                          }
                        />
                      </div>
                    ))}
                    </AnimatePresence>
                  </motion.div>
                </>
              ) : null}
            </WorkspaceSection>

            {/* Reviewers */}
            <WorkspaceSection icon={<Users />} title="Reviewers">
              <div className="flex gap-2.5">
                <Input type="email" value={reviewerEmail} onChange={event => setReviewerEmail(event.target.value)} placeholder="reviewer@firm.com" className="flex-1" />
                <Button
                  variant="glossy"
                  size="sm"
                  onClick={() => void inviteReviewer()}
                  disabled={actionBusy === "reviewer" || !reviewerEmail.trim()}
                >
                  <Users className="size-3.5" />
                  Add reviewer
                </Button>
              </div>

              <motion.div className="mt-4 space-y-3" variants={m.staggerParent()} initial="hidden" animate="show">
                <AnimatePresence initial={false}>
                {members.filter(member => member.role === "reviewer").map(member => (
                  <div key={member.id} className="rounded-md border border-border bg-white">
                    <MobileRow
                      title={member.member_email}
                      meta={
                        <StatusBadge tone={member.status === "revoked" ? "neutral" : member.status === "active" ? "success" : "info"}>
                          <span className="capitalize">{member.status}</span>
                        </StatusBadge>
                      }
                      trailing={
                        member.status !== "revoked" ? (
                          <InlineAction tone="danger" className="text-xs" onClick={() => void revokeReviewer(member.id)} disabled={actionBusy === member.id}>
                            Remove
                          </InlineAction>
                        ) : null
                      }
                    />
                  </div>
                ))}
                </AnimatePresence>
              </motion.div>
            </WorkspaceSection>
          </div>
        ) : null}

        {/* Email-in address */}
        {activeWorkspace?.role === "owner" ? (
          <WorkspaceSection
            id="email-in-address"
            icon={<AtSign />}
            title="Email intake"
            hint="Forward supplier documents to one workspace address."
            className="shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="rounded-lg border border-[var(--workspace-border)] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700">
                    <Mail className="size-4.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-black">Forwarding address</p>
                    <p className="mt-0.5 text-xs font-medium text-[var(--workspace-muted)]">Accepted attachments appear below.</p>
                  </div>
                </div>
                <StatusBadge tone={address?.address ? "success" : "processing"}>
                  {address?.address ? "Ready" : "Provisioning"}
                </StatusBadge>
              </div>
              <div className="mt-4 flex flex-col gap-3 rounded-md border border-[#d8dde6] bg-[#f8fafc] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 break-all font-mono text-sm text-black">
                  {address?.address || "Provisioning address..."}
                </p>
                <InlineAction onClick={() => void copyAddress()} disabled={!address} className="shrink-0">
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={copied ? "copied" : "copy"}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={m.tFast}
                      className="inline-flex items-center gap-1.5"
                    >
                      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                      {copied ? "Copied!" : "Copy address"}
                    </motion.span>
                  </AnimatePresence>
                </InlineAction>
              </div>
            </div>
            {loadError ? (
              <p className="mt-3 text-sm text-destructive">{loadError}</p>
            ) : null}
          </WorkspaceSection>
        ) : null}

        {/* P6 — Connected sources (Google Drive / Dropbox watch folders) */}
        {activeWorkspace?.role === "owner" ? (
          <WorkspaceSection
            icon={<FolderSync />}
            title="Watched folders"
            hint="Connect a cloud folder and choose where AxLiner should collect new files."
            className="shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {(["google_drive", "dropbox"] as ConnectedSourceProvider[]).map((provider) => {
                const source = connectedSources.find(item => item.provider === provider && item.status !== "disconnected")
                const configured = providersConfigured[provider]
                const label = provider === "google_drive" ? "Google Drive" : "Dropbox"
                return (
                  <div
                    key={provider}
                    className={cn(
                      "rounded-lg border p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]",
                      source?.status === "connected"
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-[var(--workspace-border)] bg-white",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex size-9 items-center justify-center rounded-md bg-[#eff6ff] text-[var(--workspace-blue)]">
                          {provider === "google_drive" ? <FolderInput className="size-4.5" /> : <Cloud className="size-4.5" />}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-black">{label}</p>
                          {source?.account_email ? (
                            <p className="truncate text-xs text-black">{source.account_email}</p>
                          ) : (
                            <p className="truncate text-xs font-medium text-[var(--workspace-muted)]">
                              {configured ? "Ready to connect" : "Provider setup pending"}
                            </p>
                          )}
                        </div>
                      </div>
                      {source ? (
                        <StatusBadge tone={source.status === "connected" ? "success" : source.status === "error" ? "error" : "neutral"}>
                          <BadgeValue value={source.status === "connected" ? "Watching" : source.status === "error" ? "Needs attention" : "Paused"} />
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone={configured ? "info" : "neutral"}>
                          {configured ? "Available" : "Setup pending"}
                        </StatusBadge>
                      )}
                    </div>

                    {source && source.status === "connected" ? (
                      <>
                        <div className="mt-4">
                          <Field label="Watched folder" icon={<FolderSync />}>
                            {folderDraft?.id === source.id ? (
                              <div className="flex items-center gap-3">
                                <Input
                                  value={folderDraft.value}
                                  onChange={(event) => setFolderDraft({ id: source.id, value: event.target.value })}
                                  placeholder={provider === "google_drive" ? "AxLiner intake" : "/AxLiner intake"}
                                  className="h-9"
                                />
                                <InlineAction tone="success" onClick={() => void saveWatchedFolder(source.id)} disabled={actionBusy === source.id} className="shrink-0">
                                  Save
                                </InlineAction>
                                <InlineAction onClick={() => setFolderDraft(null)} className="shrink-0" aria-label="Cancel">
                                  <X className="size-3.5" />
                                </InlineAction>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-3">
                                <Input
                                  readOnly
                                  value={source.watched_folder || ""}
                                  placeholder={provider === "google_drive" ? "AxLiner intake" : "/AxLiner intake"}
                                  className="h-9"
                                  onClick={() => setFolderDraft({ id: source.id, value: source.watched_folder || "" })}
                                />
                                <InlineAction className="shrink-0 text-xs" onClick={() => setFolderDraft({ id: source.id, value: source.watched_folder || "" })}>
                                  Edit
                                </InlineAction>
                              </div>
                            )}
                          </Field>
                        </div>
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <span className="inline-flex items-center gap-1.5 text-xs text-black">
                            <Clock className="size-3.5 text-[var(--workspace-blue)]" />
                            {source.last_synced_at ? formatReceivedAt(source.last_synced_at) : "Never synced"}
                          </span>
                          <div className="flex flex-wrap items-center gap-4">
                            <InlineAction className="text-xs [&_svg]:size-3" onClick={() => void triggerSync(source.id)} disabled={actionBusy === source.id}>
                              <RefreshCw className={cn("size-3", actionBusy === source.id && "animate-spin")} />
                              Sync now
                            </InlineAction>
                            <InlineAction tone="danger" className="text-xs" onClick={() => setDisconnectDraft(source)} disabled={actionBusy === source.id}>
                              Disconnect
                            </InlineAction>
                          </div>
                        </div>
                        {source.last_sync_status === "pending_implementation" ? (
                          <StatusBadge tone="warning" className="mt-3">Folder polling is queued</StatusBadge>
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
          </WorkspaceSection>
        ) : null}

        {/* Client submissions */}
        <WorkspaceSection
          icon={<Inbox />}
          title="Client submissions"
          actions={<span className="text-[13px] font-semibold tabular-nums text-foreground">{submissionFileCount} files</span>}
          contentClassName="p-0"
        >
          {loading ? null : submissions.length === 0 ? (
            <EmptyState
              art="upload-stack"
              icon={<Inbox />}
              title="No client files yet"
              description="Upload links and direct uploads appear here before review."
              compact
              action={(
                <Button asChild variant="surface" size="sm">
                  <Link href={activeWorkspace?.role === "owner" ? "/dashboard/inbox#client-upload-links" : "/dashboard/client#upload-files"}>
                    {activeWorkspace?.role === "owner" ? "Create upload link" : "Upload files"}
                  </Link>
                </Button>
              )}
            />
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-hidden rounded-lg border border-[var(--workspace-border)] sm:block">
                <Table className="ax-table">
                  <TableHeader>
                    <TableRow className="bg-[#f3f4f6] hover:bg-[#f3f4f6]">
                      <TableHead className={cn(cell, "pl-6")}>Filename</TableHead>
                      <TableHead className={cell}>Source</TableHead>
                      <TableHead className={cell}>Date</TableHead>
                      <TableHead className={cell}>Files</TableHead>
                      <TableHead className={cell}>Status</TableHead>
                      <TableHead className={cell} />
                    </TableRow>
                  </TableHeader>
                  <motion.tbody variants={m.staggerParent()} initial="hidden" animate="show" className="[&_tr:last-child]:border-0">
                    <AnimatePresence initial={false}>
                    {submissions.map(submission => {
                      const filename = submission.documents[0]?.original_filename || `${submission.file_count} submitted files`
                      return (
                        <MotionTableRow key={submission.id} layout variants={m.fadeUp} exit="exit">
                          <MotionTableCell className={cn(cell, "max-w-[220px] truncate pl-6 font-medium text-black")}>{filename}</MotionTableCell>
                          <MotionTableCell className={cell}>
                            <SourceBadge kind="client_link" />
                          </MotionTableCell>
                           <MotionTableCell className={cn(cell, "ax-data-date")}>{formatReceivedAt(submission.created_at)}</MotionTableCell>
                          <MotionTableCell className={cn(cell, "tabular-nums text-black")}>{submission.file_count}</MotionTableCell>
                          <MotionTableCell className={cell}>
                            <StatusBadge tone={submissionTone(submission)}>
                              <BadgeValue value={(submission.job_status || submission.status).replace(/_/g, " ")} />
                            </StatusBadge>
                          </MotionTableCell>
                          <MotionTableCell className={cell}>
                            {submission.job_id ? (
                              <InlineAction asChild>
                                <Link href={`/dashboard/client?job_id=${encodeURIComponent(submission.job_id)}`}>Review</Link>
                              </InlineAction>
                            ) : null}
                          </MotionTableCell>
                        </MotionTableRow>
                      )
                    })}
                    </AnimatePresence>
                  </motion.tbody>
                </Table>
              </div>

              {/* Mobile card stack */}
              <motion.div className="divide-y divide-border sm:hidden" variants={m.staggerParent()} initial="hidden" animate="show">
                <AnimatePresence initial={false}>
                {submissions.map(submission => {
                  const filename = submission.documents[0]?.original_filename || `${submission.file_count} submitted files`
                  return (
                    <MobileRow
                      key={submission.id}
                      title={filename}
                      meta={
                        <>
                          <StatusBadge tone={submissionTone(submission)}>
                            <BadgeValue value={(submission.job_status || submission.status).replace(/_/g, " ")} />
                          </StatusBadge>
                          <span>{submission.file_count} file{submission.file_count !== 1 ? "s" : ""}</span>
                          <span>{formatReceivedAt(submission.created_at)}</span>
                        </>
                      }
                      trailing={
                        submission.job_id ? (
                          <InlineAction asChild>
                            <Link href={`/dashboard/client?job_id=${encodeURIComponent(submission.job_id)}`}>Review</Link>
                          </InlineAction>
                        ) : null
                      }
                    />
                  )
                })}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </WorkspaceSection>

        {/* Imported documents (email messages) */}
        <WorkspaceSection
          icon={<Mailbox />}
          title="Imported from email"
          actions={<span className="text-[13px] font-semibold tabular-nums text-foreground">{importCount} files</span>}
          contentClassName="p-0"
        >
          {loading ? null : messages.length === 0 ? (
            <EmptyState
              art="all-clear"
              icon={<Mail />}
              title="No forwarded files yet"
              description="Forward documents to the workspace address; accepted attachments appear here."
              compact
              action={(
                <Button asChild variant="surface" size="sm">
                  <Link href={activeWorkspace?.role === "owner" ? "/dashboard/inbox#email-in-address" : "/dashboard/guide"}>
                    {activeWorkspace?.role === "owner" ? "Find the email address" : "Open the intake guide"}
                  </Link>
                </Button>
              )}
            />
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-lg border border-[var(--workspace-border)] sm:block">
                <Table className="ax-table">
                  <TableHeader>
                    <TableRow className="bg-[#f3f4f6] hover:bg-[#f3f4f6]">
                      <TableHead className={cn(cell, "pl-6")}>Sender</TableHead>
                      <TableHead className={cell}>Documents</TableHead>
                      <TableHead className={cell}>Source</TableHead>
                      <TableHead className={cell}>Received</TableHead>
                      <TableHead className={cell}>Status</TableHead>
                      <TableHead className={cell} />
                    </TableRow>
                  </TableHeader>
                  <motion.tbody variants={m.staggerParent()} initial="hidden" animate="show" className="[&_tr:last-child]:border-0">
                    <AnimatePresence initial={false}>
                    {messages.map((message) => {
                      const state = messageState(message)
                      const documentNames = message.documents.map(document => document.original_filename).join(", ")
                      const tone = state === "Ready" ? "success" : (state === "Failed" || state === "Rejected") ? "error" : state === "Reading" ? "processing" : "neutral"
                      return (
                        <MotionTableRow key={message.id} layout variants={m.fadeUp} exit="exit">
                          <MotionTableCell className={cn(cell, "max-w-[220px] pl-6")}>
                            <p className="ax-data-entity truncate text-sm">{message.sender || "Unknown sender"}</p>
                            <p className="ax-data-reference mt-1 truncate text-xs">{message.source_email_reference}</p>
                          </MotionTableCell>
                          <MotionTableCell className={cn(cell, "max-w-[260px] truncate text-sm text-black")}>
                            {documentNames || `${message.attachment_count} attachment${message.attachment_count === 1 ? "" : "s"}`}
                          </MotionTableCell>
                          <MotionTableCell className={cell}>
                            <SourceBadge kind="email" />
                          </MotionTableCell>
                          <MotionTableCell className={cn(cell, "ax-data-date")}>{formatReceivedAt(message.received_at)}</MotionTableCell>
                          <MotionTableCell className={cell}>
                            <StatusBadge tone={tone}><BadgeValue value={state} /></StatusBadge>
                          </MotionTableCell>
                          <MotionTableCell className={cell}>
                            {message.job_id ? (
                              <InlineAction asChild>
                                <Link href={`/dashboard/client?job_id=${encodeURIComponent(message.job_id)}`}>Review</Link>
                              </InlineAction>
                            ) : (
                              <StatusBadge tone="neutral">
                                {message.rejected_attachments.length ? "Not imported" : "Pending"}
                              </StatusBadge>
                            )}
                          </MotionTableCell>
                        </MotionTableRow>
                      )
                    })}
                    </AnimatePresence>
                  </motion.tbody>
                </Table>
              </div>

              <motion.div className="divide-y divide-border sm:hidden" variants={m.staggerParent()} initial="hidden" animate="show">
                <AnimatePresence initial={false}>
                {messages.map((message) => {
                  const state = messageState(message)
                  const documentNames = message.documents.map(document => document.original_filename).join(", ")
                  const tone = state === "Ready" ? "success" : (state === "Failed" || state === "Rejected") ? "error" : state === "Reading" ? "processing" : "neutral"
                  return (
                    <MobileRow
                      key={message.id}
                      title={message.sender || "Unknown sender"}
                      meta={
                        <>
                          <SourceBadge kind="email" />
                          <StatusBadge tone={tone}><BadgeValue value={state} /></StatusBadge>
                        </>
                      }
                      trailing={
                        message.job_id ? (
                          <InlineAction asChild>
                            <Link href={`/dashboard/client?job_id=${encodeURIComponent(message.job_id)}`}>Review</Link>
                          </InlineAction>
                        ) : (
                          <StatusBadge tone="neutral">
                            {message.rejected_attachments.length ? "Not imported" : "Pending"}
                          </StatusBadge>
                        )
                      }
                    >
                      <p className="ax-data-reference truncate text-xs">{message.source_email_reference}</p>
                      <p className="truncate text-sm text-black">
                        {documentNames || `${message.attachment_count} attachment${message.attachment_count === 1 ? "" : "s"}`}
                      </p>
                    </MobileRow>
                  )
                })}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </WorkspaceSection>
      </div>

      <Dialog open={Boolean(disconnectDraft)} onOpenChange={(open) => !open && setDisconnectDraft(null)}>
        <DialogContent className="gap-5 rounded-md sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disconnect folder watch</DialogTitle>
            <DialogDescription className="text-sm leading-6 text-foreground">
              AxLiner will stop pulling new files from this source. Files already collected stay in the inbox and review board.
            </DialogDescription>
          </DialogHeader>
          {disconnectDraft ? (
            <div className="rounded-md border border-[var(--workspace-border)] bg-[var(--workspace-soft)] px-3 py-2 text-sm">
              <p className="font-semibold text-foreground">
                {disconnectDraft.provider === "google_drive" ? "Google Drive" : "Dropbox"}
              </p>
              {disconnectDraft.account_email ? (
                <p className="mt-0.5 truncate text-xs text-foreground">{disconnectDraft.account_email}</p>
              ) : null}
            </div>
          ) : null}
          <DialogFooter className="items-center gap-3">
            <InlineAction onClick={() => setDisconnectDraft(null)} disabled={Boolean(disconnectDraft && actionBusy === disconnectDraft.id)}>
              Cancel
            </InlineAction>
            <Button
              variant="dangerOutline"
              size="sm"
              onClick={() => disconnectDraft && void disconnectSource(disconnectDraft.id)}
              disabled={Boolean(disconnectDraft && actionBusy === disconnectDraft.id)}
            >
              Disconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}

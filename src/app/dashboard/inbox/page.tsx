"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Copy, Inbox, Link2, RefreshCw, UserPlus } from "lucide-react"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import {
  clientIntakeApi,
  emailIntakeApi,
  workspaceApi,
  type ClientUploadLink,
  type ClientUploadSubmission,
  type EmailIntakeAddress,
  type EmailIntakeMessage,
  type WorkspaceMember,
} from "@/lib/api-client"
import { cn } from "@/lib/utils"

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
        const [intake, currentLinks, currentMembers] = await Promise.all([
          emailIntakeApi.getAddress(activeWorkspace.id),
          clientIntakeApi.listLinks(activeWorkspace.id),
          workspaceApi.members(activeWorkspace.id),
        ])
        setAddress(intake)
        setLinks(currentLinks.links)
        setMembers(currentMembers.members)
      } else {
        setAddress(null)
        setLinks([])
        setMembers([])
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

  if (authLoading || workspaceLoading || !user) {
    return <DashboardRouteLoader label="Loading inbox" />
  }

  return (
    <DashboardShell activeItem="inbox" title="Inbox" user={user} showBack={false}>
      <div className="max-w-6xl space-y-5">
        <PageHeader
          title="Email intake"
          description="Forward invoice and receipt attachments into Auto detect."
          actions={
            <Button variant="surface" size="sm" onClick={() => void loadInbox()} disabled={loading}>
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              Refresh
            </Button>
          }
        />

        {/* Management cards — stack on mobile, side-by-side on lg */}
        {activeWorkspace?.role === "owner" ? (
          <div className="grid gap-4 lg:grid-cols-2">

            {/* Client upload links */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Image src="/icons/share.png" alt="" width={20} height={20} className="object-contain opacity-85" loading="lazy" />
                  <p className="text-sm font-semibold text-foreground">Client upload links</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Links expire after 7 days and submit files directly to this inbox.</p>

                <div className="mt-4 flex gap-2">
                  <Input value={linkLabel} onChange={event => setLinkLabel(event.target.value)} placeholder="Client documents" />
                  <Button variant="glossy" onClick={() => void createClientLink()} disabled={actionBusy === "link"}>
                    <Link2 className="size-4" />
                    Create
                  </Button>
                </div>

                {newUploadUrl ? (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                    <p className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{newUploadUrl}</p>
                    <Button variant="surface" size="sm" onClick={() => void navigator.clipboard.writeText(newUploadUrl)}>Copy</Button>
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
                                  <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => void revokeClientLink(link.id)} disabled={actionBusy === link.id}>
                                    Revoke
                                  </Button>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Revoked</span>
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
                            <Button variant="ghost" size="sm" className="h-7 shrink-0 px-2 text-xs" onClick={() => void revokeClientLink(link.id)} disabled={actionBusy === link.id}>
                              Revoke
                            </Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>

            {/* Reviewers */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  <Image src="/icons/reviewer.png" alt="" width={20} height={20} className="object-contain opacity-85" loading="lazy" />
                  <p className="text-sm font-semibold text-foreground">Reviewers</p>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">Reviewers can edit and export batches, not manage connections or deletion.</p>

                <div className="mt-4 flex gap-2">
                  <Input type="email" value={reviewerEmail} onChange={event => setReviewerEmail(event.target.value)} placeholder="reviewer@firm.com" />
                  <Button variant="surface" onClick={() => void inviteReviewer()} disabled={actionBusy === "reviewer"}>
                    <UserPlus className="size-4" />
                    Add
                  </Button>
                </div>

                <div className="mt-3 space-y-2">
                  {members.filter(member => member.role === "reviewer").map(member => (
                    <div key={member.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{member.member_email}</p>
                        <p className="mt-0.5 text-xs capitalize text-muted-foreground">{member.status}</p>
                      </div>
                      {member.status !== "revoked" ? (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => void revokeReviewer(member.id)} disabled={actionBusy === member.id}>
                          Remove
                        </Button>
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
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Forward documents to</p>
                  <p className="mt-2 break-all font-mono text-sm font-medium text-foreground">
                    {address?.address || "Provisioning address…"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Supported images and PDFs are stored for 30 days and enter the review board with their email origin.
                  </p>
                </div>
                <Button variant="surface" onClick={() => void copyAddress()} disabled={!address} className="shrink-0">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied!" : "Copy address"}
                </Button>
              </div>
              {loadError ? (
                <p className="mt-3 text-sm text-destructive">{loadError}</p>
              ) : null}
            </CardContent>
          </Card>
        ) : null}

        {/* Client submissions */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Client submissions</h2>
          <Badge variant="outline">{submissions.reduce((count, submission) => count + submission.file_count, 0)} files</Badge>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-4"><EmptyState compact icon={<RefreshCw className="animate-spin h-5 w-5" />} title="Loading submissions" description="Fetching client uploads" /></div>
            ) : submissions.length === 0 ? (
              <div className="py-4"><EmptyState compact icon={<Inbox />} illustration="/illustrations/empty-inbox.png" title="No submissions yet" description="Clients can upload via a shared link you create above." /></div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/40">
                        <th className="px-5 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Filename</th>
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
                            <td className="px-4 py-3 text-muted-foreground">{formatReceivedAt(submission.created_at)}</td>
                            <td className="px-4 py-3 tabular-nums text-muted-foreground">{submission.file_count}</td>
                            <td className="px-4 py-3">
                              <StatusBadge tone={submissionTone(submission)}>
                                {(submission.job_status || submission.status).replace(/_/g, " ")}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-3">
                              {submission.job_id ? (
                                <Button asChild variant="surface" size="sm" className="h-7">
                                  <Link href={`/dashboard/client?job_id=${encodeURIComponent(submission.job_id)}`}>Review</Link>
                                </Button>
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
                            <Button asChild variant="surface" size="sm" className="h-7">
                              <Link href={`/dashboard/client?job_id=${encodeURIComponent(submission.job_id)}`}>Review</Link>
                            </Button>
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
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Imported documents</h2>
          <Badge variant="outline">{importCount} files</Badge>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-4"><EmptyState compact icon={<RefreshCw className="animate-spin h-5 w-5" />} title="Loading imports" description="Fetching forwarded documents" /></div>
            ) : messages.length === 0 ? (
              <div className="py-4"><EmptyState compact icon={<Inbox />} illustration="/illustrations/client-upload.png" title="No emailed documents yet" description="New attachments will appear here for review." /></div>
            ) : (
              <div className="divide-y divide-border">
                {messages.map((message) => {
                  const state = messageState(message)
                  const documentNames = message.documents.map(document => document.original_filename).join(", ")
                  const tone = state === "Ready" ? "success" : (state === "Failed" || state === "Rejected") ? "error" : state === "Processing" ? "processing" : "neutral"
                  return (
                    <div key={message.id} className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(12rem,1.1fr)_minmax(12rem,1.6fr)_10rem_7rem_auto] lg:items-center">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{message.sender || "Unknown sender"}</p>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{message.source_email_reference}</p>
                      </div>
                      <p className="truncate text-sm text-foreground">
                        {documentNames || `${message.attachment_count} attachment${message.attachment_count === 1 ? "" : "s"}`}
                      </p>
                      <p className="text-sm text-muted-foreground">{formatReceivedAt(message.received_at)}</p>
                      <StatusBadge tone={tone}>{state}</StatusBadge>
                      {message.job_id ? (
                        <Button asChild variant="surface" size="sm" className="h-7">
                          <Link href={`/dashboard/client?job_id=${encodeURIComponent(message.job_id)}`}>Review</Link>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
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

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Copy, Inbox, Link2, RefreshCw, Trash2, UserPlus } from "lucide-react"
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

        {activeWorkspace?.role === "owner" ? (
          <Card className="gap-0 py-0">
            <CardContent className="px-0">
              <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(18rem,1fr)_minmax(16rem,1fr)]">
                <div>
                  <p className="text-sm font-semibold text-foreground">Client upload links</p>
                  <p className="mt-1 text-sm text-muted-foreground">Links expire after 7 days and submit files directly to this inbox.</p>
                  <div className="mt-4 flex gap-2">
                    <Input value={linkLabel} onChange={event => setLinkLabel(event.target.value)} placeholder="Client documents" />
                    <Button variant="glossy" onClick={() => void createClientLink()} disabled={actionBusy === "link"}>
                      <Link2 className="size-4" />
                      Create
                    </Button>
                  </div>
                  {newUploadUrl ? (
                    <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-muted/40 p-2">
                      <p className="min-w-0 flex-1 truncate text-xs text-foreground">{newUploadUrl}</p>
                      <Button variant="surface" size="sm" onClick={() => void navigator.clipboard.writeText(newUploadUrl)}>Copy</Button>
                    </div>
                  ) : null}
                  <div className="mt-3 space-y-2">
                    {links.slice(0, 4).map(link => (
                      <div key={link.id} className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{link.label}</p>
                          <p className="text-xs text-muted-foreground">{link.submission_count}/{link.max_submissions} submissions {link.enabled ? "" : "- revoked"}</p>
                        </div>
                        {link.enabled ? (
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => void revokeClientLink(link.id)} disabled={actionBusy === link.id}>
                            <Trash2 className="size-4" />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Reviewers</p>
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
                      <div key={member.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
                        <div>
                          <p className="font-medium">{member.member_email}</p>
                          <p className="text-xs text-muted-foreground">{member.status}</p>
                        </div>
                        {member.status !== "revoked" ? (
                          <Button variant="ghost" size="sm" onClick={() => void revokeReviewer(member.id)} disabled={actionBusy === member.id}>Remove</Button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeWorkspace?.role === "owner" ? <Card className="gap-0 py-0">
          <CardContent className="px-0">
            <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">Forward documents to</p>
                <p className="mt-2 break-all font-mono text-sm font-medium text-foreground">
                  {address?.address || "Provisioning address..."}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supported images and PDFs are stored for 30 days and enter the review board with their email origin.
                </p>
              </div>
              <Button variant="surface" onClick={() => void copyAddress()} disabled={!address}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                {copied ? "Copied" : "Copy address"}
              </Button>
            </div>
            {loadError ? (
              <div className="border-t border-border px-5 py-3 text-sm text-destructive">
                {loadError}
              </div>
            ) : null}
          </CardContent>
        </Card> : null}

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Client submissions</h2>
          <Badge variant="outline">{submissions.reduce((count, submission) => count + submission.file_count, 0)} files</Badge>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="px-0">
            {loading ? (
              <div className="py-4"><EmptyState compact icon={<RefreshCw className="animate-spin h-5 w-5" />} title="Loading submissions" description="Fetching client uploads" /></div>
            ) : submissions.length === 0 ? (
              <div className="py-4"><EmptyState compact icon={<Inbox />} illustration="/illustrations/empty-inbox.png" title="No submissions yet" description="Clients can upload via a shared link you create above." /></div>
            ) : (
              <div className="divide-y divide-border">
                {submissions.map(submission => (
                  <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-sm font-medium">{submission.documents.map(item => item.original_filename).join(", ") || `${submission.file_count} submitted files`}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatReceivedAt(submission.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{submission.job_status || submission.status}</Badge>
                      {submission.job_id ? (
                        <Button asChild variant="surface" size="sm">
                          <Link href={`/dashboard/client?job_id=${encodeURIComponent(submission.job_id)}`}>Review</Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Imported documents</h2>
          <Badge variant="outline">{importCount} files</Badge>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="px-0">
            {loading ? (
              <div className="py-4"><EmptyState compact icon={<RefreshCw className="animate-spin h-5 w-5" />} title="Loading imports" description="Fetching forwarded documents" /></div>
            ) : messages.length === 0 ? (
              <div className="py-4"><EmptyState compact icon={<Inbox />} title="No emailed documents yet" description="New attachments will appear here for review." /></div>
            ) : (
              <div className="divide-y divide-border">
                {messages.map((message) => {
                  const state = messageState(message)
                  const documentNames = message.documents.map(document => document.original_filename).join(", ")
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
                      <StatusBadge
                        tone={state === "Ready" ? "success" : (state === "Failed" || state === "Rejected") ? "error" : state === "Processing" ? "processing" : "neutral"}
                      >
                        {state}
                      </StatusBadge>
                      {message.job_id ? (
                        <Button asChild variant="surface" size="sm">
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

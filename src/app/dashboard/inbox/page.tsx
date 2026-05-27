"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check, Copy, Inbox, RefreshCw } from "lucide-react"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { emailIntakeApi, type EmailIntakeAddress, type EmailIntakeMessage } from "@/lib/api-client"
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
  const [address, setAddress] = useState<EmailIntakeAddress | null>(null)
  const [messages, setMessages] = useState<EmailIntakeMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/sign-in?next=%2Fdashboard%2Finbox")
    }
  }, [authLoading, router, user])

  const loadInbox = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setLoadError(null)
    try {
      const [intake, received] = await Promise.all([
        emailIntakeApi.getAddress(),
        emailIntakeApi.listMessages(),
      ])
      setAddress(intake)
      setMessages(received.messages)
    } catch {
      setLoadError("Email intake is unavailable right now. Refresh after your workspace is ready.")
    } finally {
      setLoading(false)
    }
  }, [user])

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

  if (authLoading || !user) {
    return <DashboardRouteLoader label="Loading inbox" />
  }

  return (
    <DashboardShell activeItem="inbox" title="Inbox" user={user} showBack={false}>
      <div className="max-w-6xl space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Email intake</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Forward invoice and receipt attachments into Auto detect.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadInbox()} disabled={loading}>
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <Card className="gap-0 py-0">
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
              <Button variant="outline" onClick={() => void copyAddress()} disabled={!address}>
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
        </Card>

        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Imported documents</h2>
          <Badge variant="outline">{importCount} files</Badge>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="px-0">
            {loading ? (
              <div className="px-5 py-12 text-sm text-muted-foreground">Loading imports...</div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-14 text-center">
                <Inbox className="size-5 text-muted-foreground" />
                <p className="mt-4 text-sm font-medium text-foreground">No emailed documents yet</p>
                <p className="mt-1 text-sm text-muted-foreground">New attachments will appear here for review.</p>
              </div>
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
                      <Badge
                        variant="outline"
                        className={cn(
                          state === "Ready" && "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
                          (state === "Failed" || state === "Rejected") && "border-destructive/25 text-destructive",
                        )}
                      >
                        {state}
                      </Badge>
                      {message.job_id ? (
                        <Button asChild variant="outline" size="sm">
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

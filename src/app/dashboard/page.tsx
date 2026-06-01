"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Clock3, FileSpreadsheet, RefreshCw, Upload, Users } from "lucide-react"

import { DashboardShell } from "@/components/DashboardShell"
import { ClientsTab } from "@/components/dashboard/ClientsTab"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatusBadge } from "@/components/dashboard/StatusBadge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { clientIntakeApi, ocrApi, type ClientAnalyticsRow } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type RecentJob = {
  id: string
  filename: string
  status: string
  createdAt: string
}

function statusTone(status: string): "success" | "error" | "processing" | "info" | "neutral" {
  if (status === "completed" || status === "partially_completed") return "success"
  if (status === "failed") return "error"
  if (status === "processing") return "processing"
  if (status === "queued") return "info"
  return "neutral"
}

function formatStatus(status: string) {
  if (status === "completed") return "Ready"
  return status.replace(/_/g, " ")
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value))
  } catch {
    return "-"
  }
}

function normalizeJobs(response: any): RecentJob[] {
  const jobs = Array.isArray(response)
    ? response
    : response?.jobs || response?.history || response?.items || response?.data || []

  return jobs.slice(0, 6).map((job: any) => ({
    id: String(job.id || job.job_id || job.original_job_id),
    filename: job.filename || "Untitled document",
    status: job.status || "completed",
    createdAt: job.saved_at || job.created_at || job.completed_at || new Date().toISOString(),
  }))
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const [clients, setClients] = useState<ClientAnalyticsRow[]>([])
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) router.replace("/sign-in?next=%2Fdashboard")
  }, [authLoading, router, user])

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [history, analytics] = await Promise.all([
        ocrApi.getHistory(6, 0).catch(() => []),
        activeWorkspace?.id
          ? clientIntakeApi.analytics(activeWorkspace.id, 14).catch(() => ({ clients: [], total: 0 }))
          : Promise.resolve({ clients: [], total: 0 }),
      ])
      setRecentJobs(normalizeJobs(history))
      setClients(analytics.clients)
    } finally {
      setLoading(false)
    }
  }, [activeWorkspace?.id, user])

  useEffect(() => {
    void load()
  }, [load])

  const summary = useMemo(() => ({
    clients: clients.length,
    waiting: clients.filter(client => client.is_late || client.never_submitted).length,
    documents: clients.reduce((total, client) => total + client.documents_this_month, 0),
  }), [clients])

  if (authLoading || !user) {
    return <DashboardRouteLoader label="Loading workspace" />
  }

  return (
    <DashboardShell activeItem="overview" title="Home" user={user} showBack={false}>
      <div className="max-w-6xl space-y-6">
        <PageHeader
          title="Home"
          description="Keep client submissions moving from intake to review."
          actions={
            <div className="flex items-center gap-2">
              <Button variant="surface" size="sm" onClick={() => void load()} disabled={loading}>
                <RefreshCw className={cn("size-4", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button asChild variant="glossy" size="sm">
                <Link href="/dashboard/client">
                  <Upload className="size-4" />
                  Upload documents
                </Link>
              </Button>
            </div>
          }
        />

        <section className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">Active clients</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{summary.clients}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">Need attention</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{summary.waiting}</p>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-muted-foreground">Documents this month</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{summary.documents}</p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Client work queue</h2>
              <p className="mt-1 text-sm text-muted-foreground">Follow up on late submissions and open recent client work.</p>
            </div>
            <Button asChild variant="surface" size="sm">
              <Link href="/dashboard/clients">
                View clients
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <ClientsTab workspaceId={activeWorkspace?.id} compact />
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recent documents</h2>
              <p className="mt-1 text-sm text-muted-foreground">Latest batches saved in this workspace.</p>
            </div>
            <Button asChild variant="surface" size="sm">
              <Link href="/history">
                View activity
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            {loading ? (
              <div className="px-5 py-8 text-sm text-muted-foreground">Loading recent work...</div>
            ) : recentJobs.length ? (
              <div className="divide-y divide-border">
                {recentJobs.map(job => (
                  <div key={job.id} className="grid gap-2 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-5">
                    <div className="flex min-w-0 items-center gap-3">
                      <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm font-medium text-foreground">{job.filename}</span>
                    </div>
                    <StatusBadge tone={statusTone(job.status)}>{formatStatus(job.status)}</StatusBadge>
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock3 className="size-3.5" />
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 px-5 py-8 text-sm text-muted-foreground">
                <Users className="size-4" />
                Upload a batch to start the review queue.
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardShell>
  )
}

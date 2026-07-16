"use client"

import * as React from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  ArrowRight,
  CircleAlert,
  Inbox,
  Layers,
  LoaderCircle,
  RefreshCw,
  Search,
  Upload,
  X,
} from "lucide-react"

import { EmptyState } from "@/components/dashboard/EmptyState"
import { SegmentedTabs } from "@/components/dashboard/SegmentedTabs"
import { SkeletonList } from "@/components/dashboard/SkeletonTable"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { Button } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { Input } from "@/components/ui/input"
import { ocrApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type Batch = {
  jobId: string
  title: string
  status: string
  count: number
  createdAt: string | null
}

type QueueFilter = "all" | "review" | "active" | "issues"

const ACTIVE_STATUSES = new Set(["queued", "processing"])
const REVIEW_STATUSES = new Set(["completed", "partially_completed"])
const ISSUE_STATUSES = new Set(["failed", "cancelled"])

function batchStatusTone(status: string): StatusTone {
  if (status === "completed") return "info"
  if (status === "partially_completed") return "warning"
  if (status === "failed") return "error"
  if (status === "cancelled") return "neutral"
  if (status === "processing") return "processing"
  if (status === "queued") return "info"
  return "neutral"
}

function statusLabel(status: string): string {
  if (status === "completed") return "Ready"
  if (status === "partially_completed") return "Check partial"
  if (status === "queued") return "Queued"
  if (status === "processing") return "Reading"
  return status.replace(/_/g, " ").replace(/^\w/, (character) => character.toUpperCase())
}

function pickCount(metadata: Record<string, any> | null | undefined): number {
  if (!metadata) return 1
  const files = metadata.generated_files
  const fileCount = Array.isArray(files) ? files.length : 0
  return Number(
    metadata.successful_images ||
      metadata.processed_images ||
      metadata.total_images ||
      fileCount ||
      1,
  )
}

function toBatch(job: Record<string, any>): Batch | null {
  const jobId = job.job_id || job.id || job.original_job_id
  if (!jobId) return null
  return {
    jobId: String(jobId),
    title: job.filename || "Untitled batch",
    status: job.status || "unknown",
    count: pickCount(job.metadata ?? job.processing_metadata),
    createdAt: job.created_at || job.updated_at || job.saved_at || null,
  }
}

function matchesFilter(batch: Batch, filter: QueueFilter) {
  if (filter === "review") return REVIEW_STATUSES.has(batch.status)
  if (filter === "active") return ACTIVE_STATUSES.has(batch.status)
  if (filter === "issues") return ISSUE_STATUSES.has(batch.status)
  return true
}

function recommendedFilter(batches: Batch[]): QueueFilter {
  if (batches.some((batch) => REVIEW_STATUSES.has(batch.status))) return "review"
  if (batches.some((batch) => ISSUE_STATUSES.has(batch.status))) return "issues"
  if (batches.some((batch) => ACTIVE_STATUSES.has(batch.status))) return "active"
  return "all"
}

function nextAction(status: string) {
  if (REVIEW_STATUSES.has(status)) return "Review"
  if (ISSUE_STATUSES.has(status)) return "Inspect"
  return "Open"
}

function BatchRow({ batch }: { batch: Batch }) {
  const relative = batch.createdAt
    ? formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true })
    : "Time unavailable"

  return (
    <Link
      href={`/dashboard/client?job_id=${encodeURIComponent(batch.jobId)}`}
      className="ax-interactive group grid min-h-14 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-[var(--workspace-border)] px-4 py-2.5 outline-none last:border-b-0 hover:bg-[var(--workspace-row-hover)] focus-visible:bg-[var(--workspace-row-hover)] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
    >
      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[var(--workspace-soft)] text-[var(--workspace-ink)]">
        {ISSUE_STATUSES.has(batch.status) ? <CircleAlert className="size-4" /> : <Layers className="size-4" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold text-foreground">{batch.title}</span>
        <span className="mt-0.5 block truncate text-[11px] text-[var(--workspace-muted)]">
          {batch.count} {batch.count === 1 ? "document" : "documents"} · {relative}
        </span>
      </span>
      <StatusBadge tone={batchStatusTone(batch.status)} size="sm" className="hidden sm:inline-flex">
        {statusLabel(batch.status)}
      </StatusBadge>
      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-foreground">
        {nextAction(batch.status)}
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

export function BatchesQueue() {
  const [batches, setBatches] = React.useState<Batch[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)
  const [filter, setFilter] = React.useState<QueueFilter>("review")
  const [query, setQuery] = React.useState("")
  const filterTouchedRef = React.useRef(false)

  const load = React.useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await ocrApi.getHistory(50, 0)
      const rows: Record<string, any>[] = Array.isArray(response)
        ? response
        : response.jobs || response.history || response.items || response.data || []
      const nextBatches = rows.map(toBatch).filter((batch): batch is Batch => batch !== null)
      setBatches(nextBatches)
      if (!filterTouchedRef.current) setFilter(recommendedFilter(nextBatches))
    } catch (loadError: any) {
      setError(loadError?.detail || loadError?.message || "Could not load batches")
      setBatches([])
    } finally {
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const counts = React.useMemo(() => ({
    all: batches?.length ?? 0,
    review: batches?.filter((batch) => REVIEW_STATUSES.has(batch.status)).length ?? 0,
    active: batches?.filter((batch) => ACTIVE_STATUSES.has(batch.status)).length ?? 0,
    issues: batches?.filter((batch) => ISSUE_STATUSES.has(batch.status)).length ?? 0,
  }), [batches])

  const visibleBatches = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return (batches ?? []).filter((batch) => (
      matchesFilter(batch, filter) &&
      (!normalizedQuery || batch.title.toLowerCase().includes(normalizedQuery))
    ))
  }, [batches, filter, query])

  const isLoading = batches === null
  const chooseFilter = (value: QueueFilter) => {
    filterTouchedRef.current = true
    setFilter(value)
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="sticky top-14 z-20 -mx-2 flex flex-col gap-2 border-y border-[color-mix(in_srgb,var(--workspace-border)_70%,transparent)] bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-2 py-2 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <SegmentedTabs
          aria-label="Filter batch register"
          size="sm"
          value={filter}
          onValueChange={(value) => chooseFilter(value as QueueFilter)}
          tabs={[
            { value: "review", label: "Review", count: counts.review },
            { value: "active", label: "In progress", count: counts.active },
            { value: "issues", label: "Issues", count: counts.issues },
            { value: "all", label: "All", count: counts.all },
          ]}
        />
        <div className="flex min-w-0 items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--workspace-muted)]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a batch"
              aria-label="Find a batch"
              className="h-8 rounded-full bg-card pl-8 text-[12px]"
            />
          </div>
          <InlineAction onClick={load} disabled={refreshing} aria-label="Refresh batch register">
            <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </InlineAction>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {error}
        </div>
      ) : null}

      <WorkspaceSection
        title="Batch register"
        icon={isLoading ? <LoaderCircle className="animate-spin" /> : <Layers />}
        hint={filter === "review" ? "Completed extraction waiting for a human check." : undefined}
        actions={!isLoading ? <span className="text-[12px] font-semibold tabular-nums text-foreground">{visibleBatches.length} shown</span> : undefined}
        contentClassName="p-0"
        compact
      >
        {isLoading ? (
          <div className="px-2 py-2"><SkeletonList rows={6} /></div>
        ) : visibleBatches.length === 0 ? (
          <EmptyState
            icon={<Inbox />}
            title={query ? "No matching batches" : filter === "all" ? "No batches yet" : `No ${filter === "active" ? "batches in progress" : filter}`}
            action={query ? (
              <InlineAction onClick={() => setQuery("")}>
                <X className="size-3.5" />
                Clear search
              </InlineAction>
            ) : batches.length ? (
              <InlineAction onClick={() => chooseFilter(recommendedFilter(batches))}>
                <ArrowRight className="size-3.5" />
                Open next queue
              </InlineAction>
            ) : (
              <Button asChild variant="glossy" size="sm">
                <Link href="/dashboard/client#upload-files">
                  <Upload className="size-3.5" />
                  Upload
                </Link>
              </Button>
            )}
            compact
          />
        ) : (
          <div>
            {visibleBatches.map((batch) => <BatchRow key={batch.jobId} batch={batch} />)}
          </div>
        )}
      </WorkspaceSection>
    </div>
  )
}

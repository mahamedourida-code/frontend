"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"
import {
  ArrowUpRight,
  CircleCheck,
  Inbox,
  Layers,
  LoaderCircle,
  RefreshCw,
} from "lucide-react"
import { formatDistanceToNow, isToday } from "date-fns"

import { EmptyState } from "@/components/dashboard/EmptyState"
import { InlineAction } from "@/components/ui/inline-action"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"
import { WorkspaceSection } from "@/components/dashboard/WorkspaceSection"
import { ocrApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

/**
 * The calm "today's batches" triage queue. A read-only inbox of recent batches
 * grouped by status — accountants land here first, scan what needs attention,
 * and click one row to drop into the deep Review board
 * (`/dashboard/client?job_id=…`). It never re-implements review, export, or
 * publish; it's the quiet front door to those flows.
 *
 * Built only on existing dashboard primitives (WorkspaceSection, StatusBadge,
 * EmptyState) and `--workspace-*` tokens so it reads as the same product.
 */

type Batch = {
  jobId: string
  title: string
  status: string
  count: number
  createdAt: string | null
}

type Bucket = "processing" | "review" | "today" | "earlier"

const BUCKET_META: Record<
  Bucket,
  { title: string; hint: string; icon: React.ReactNode; tone: "default" | "active" }
> = {
  processing: {
    title: "Reading",
    hint: "Still extracting — they'll move to review when they finish.",
    icon: <LoaderCircle className="animate-spin" />,
    tone: "active",
  },
  review: {
    title: "Needs review",
    hint: "Open one to correct exceptions, then export or publish.",
    icon: <Layers />,
    tone: "default",
  },
  today: {
    title: "Done today",
    hint: "Reviewed and exported earlier today.",
    icon: <CircleCheck />,
    tone: "default",
  },
  earlier: {
    title: "Earlier",
    hint: "Older stacks — reopen any to review or re-export.",
    icon: <Inbox />,
    tone: "default",
  },
}

const ACTIVE_STATUSES = new Set(["queued", "processing"])
const REVIEW_STATUSES = new Set(["completed", "partially_completed"])

function batchStatusTone(status: string): StatusTone {
  if (status === "completed" || status === "partially_completed") return "success"
  if (status === "failed") return "error"
  if (status === "cancelled") return "neutral"
  if (status === "processing") return "processing"
  if (status === "queued") return "info"
  return "neutral"
}

function statusLabel(status: string): string {
  if (status === "completed") return "Ready"
  if (status === "partially_completed") return "Partial"
  if (status === "queued") return "Waiting"
  if (status === "processing") return "Reading"
  return status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase())
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
    title: job.filename || "Untitled stack",
    status: job.status || "unknown",
    count: pickCount(job.metadata ?? job.processing_metadata),
    createdAt: job.created_at || job.updated_at || job.saved_at || null,
  }
}

function bucketFor(batch: Batch): Bucket {
  if (ACTIVE_STATUSES.has(batch.status)) return "processing"
  if (REVIEW_STATUSES.has(batch.status)) {
    if (batch.createdAt && isToday(new Date(batch.createdAt))) return "today"
    return "review"
  }
  return "earlier"
}

const BUCKET_ORDER: Bucket[] = ["processing", "review", "today", "earlier"]

function BatchRow({ batch, index }: { batch: Batch; index: number }) {
  const router = useRouter()
  const prefersReducedMotion = useReducedMotion()
  const open = () => router.push(`/dashboard/client?job_id=${batch.jobId}`)
  const relative = batch.createdAt
    ? formatDistanceToNow(new Date(batch.createdAt), { addSuffix: true })
    : "—"

  return (
    <motion.button
      type="button"
      onClick={open}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="ax-interactive group flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left transition-colors hover:border-[var(--workspace-border)] hover:bg-[var(--workspace-row-hover)]"
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--workspace-primary)_10%,transparent)] text-[var(--workspace-primary)] [&_svg]:size-[18px]">
        <Layers />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{batch.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {batch.count} {batch.count === 1 ? "doc" : "docs"} · {relative}
        </p>
      </div>
      <StatusBadge tone={batchStatusTone(batch.status)} className="hidden sm:inline-flex">
        {statusLabel(batch.status)}
      </StatusBadge>
      <ArrowUpRight className="size-4 shrink-0 text-[var(--workspace-blue)] opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.button>
  )
}

export function BatchesQueue() {
  const [batches, setBatches] = React.useState<Batch[] | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [refreshing, setRefreshing] = React.useState(false)

  const load = React.useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const response = await ocrApi.getHistory(50, 0)
      const rows: Record<string, any>[] = Array.isArray(response)
        ? response
        : response.jobs || response.history || response.items || response.data || []
      setBatches(rows.map(toBatch).filter((b): b is Batch => b !== null))
    } catch (err: any) {
      setError(err?.detail || err?.message || "Could not load stacks")
      setBatches([])
    } finally {
      setRefreshing(false)
    }
  }, [])

  React.useEffect(() => {
    void load()
  }, [load])

  const grouped = React.useMemo(() => {
    const groups: Record<Bucket, Batch[]> = {
      processing: [],
      review: [],
      today: [],
      earlier: [],
    }
    for (const batch of batches ?? []) {
      groups[bucketFor(batch)].push(batch)
    }
    return groups
  }, [batches])

  const total = batches?.length ?? 0
  const isLoading = batches === null

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">
          {isLoading
            ? "Loading stacks…"
            : `${total} ${total === 1 ? "stack" : "stacks"} to review`}
        </p>
        <InlineAction onClick={load} disabled={refreshing}>
          <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
          Refresh
        </InlineAction>
      </div>

      {error ? (
        <div className="rounded-lg border border-[color-mix(in_srgb,var(--workspace-danger)_44%,transparent)] bg-white px-4 py-3 text-sm text-[var(--workspace-danger)]">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[60px] animate-pulse rounded-xl border border-border bg-[var(--workspace-soft)]"
            />
          ))}
        </div>
      ) : total === 0 ? (
        <WorkspaceSection title="Your stacks" icon={<Layers />}>
          <EmptyState
            icon={<Inbox />}
            eyebrow="Stacks"
            title="No stacks yet"
            description="Drop a folder of invoices, receipts, or statements into the review board. Each stack you process lands here, grouped by what needs your attention."
          />
        </WorkspaceSection>
      ) : (
        BUCKET_ORDER.filter((bucket) => grouped[bucket].length > 0).map((bucket) => {
          const meta = BUCKET_META[bucket]
          const rows = grouped[bucket]
          return (
            <WorkspaceSection
              key={bucket}
              title={meta.title}
              hint={meta.hint}
              icon={meta.icon}
              tone={meta.tone}
              actions={
                <span className="font-mono text-[13px] font-semibold tabular-nums text-[var(--workspace-primary)]">
                  {rows.length}
                </span>
              }
              contentClassName="px-2 py-2 sm:px-2"
            >
              <div className="flex flex-col gap-0.5">
                {rows.map((batch, index) => (
                  <BatchRow key={batch.jobId} batch={batch} index={index} />
                ))}
              </div>
            </WorkspaceSection>
          )
        })
      )}
    </div>
  )
}

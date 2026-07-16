"use client"

import { useCallback, useEffect, useReducer, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, FileText } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { ocrApi } from "@/lib/api-client"
import { isHistoryItemDeleted, reconcileHistoryDeletions, subscribeHistoryDeletions } from "@/lib/recent-files-store"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"
import { WorkspaceActivityIndicator } from "@/components/dashboard/WorkspaceActivityIndicator"
import { useMotionTokens } from "@/lib/motion"

const MotionLink = motion.create(Link)

type WorkspaceFile = {
  id: string
  filename: string
  status: string
  createdAt: string
}

function fileStatusTone(status: string): StatusTone {
  if (status === "completed") return "success"
  if (["processing", "pending", "queued"].includes(status)) return "processing"
  if (["failed", "error"].includes(status)) return "error"
  if (status === "requires_review") return "review"
  return "neutral"
}

function fileStatusLabel(status: string) {
  if (status === "completed") return "Ready"
  if (["processing", "pending", "queued"].includes(status)) return "Reading"
  if (["failed", "error"].includes(status)) return "Failed"
  if (status === "requires_review") return "Needs review"
  return status.replace(/_/g, " ")
}

function normalizeFiles(response: any): WorkspaceFile[] {
  const rows = Array.isArray(response)
    ? response
    : response?.jobs || response?.history || response?.items || response?.data || []

  return rows.flatMap((item: any) => {
    const id = item.id || item.job_id || item.original_job_id
    const createdAt = item.updated_at || item.saved_at || item.completed_at || item.created_at

    if (!id || !createdAt) return []

    return [{
      id,
      filename: item.filename || item.original_filename || item.output_filename || "Converted file",
      status: item.status || "completed",
      createdAt,
    }]
  })
}

export function WorkspaceFilesPanel({
  refreshKey,
  workspaceId,
}: {
  refreshKey?: string
  workspaceId: string
}) {
  const m = useMotionTokens()
  const [files, setFiles] = useState<WorkspaceFile[]>([])
  const [loading, setLoading] = useState(true)
  const [, forceRender] = useReducer((tick: number) => tick + 1, 0)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    try {
      const response = await ocrApi.getHistory(50, 0, workspaceId)
      const normalized = normalizeFiles(response)
      setFiles(normalized)
      // Self-heal the durable delete set against what the server actually returns.
      reconcileHistoryDeletions(normalized.map((file) => file.id))
    } catch {
      setFiles([])
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => {
    void loadHistory()
  }, [loadHistory, refreshKey])

  useEffect(() => {
    const handleRefresh = () => {
      void loadHistory()
    }
    const handleVisible = () => {
      if (document.visibilityState === "visible") void loadHistory()
    }

    window.addEventListener("axliner:history-changed", handleRefresh)
    window.addEventListener("focus", handleRefresh)
    document.addEventListener("visibilitychange", handleVisible)
    // Re-render immediately when an item is deleted in Activity so the row drops
    // out via the filter below, even before the refetch resolves.
    const unsubscribe = subscribeHistoryDeletions(forceRender)
    return () => {
      window.removeEventListener("axliner:history-changed", handleRefresh)
      window.removeEventListener("focus", handleRefresh)
      document.removeEventListener("visibilitychange", handleVisible)
      unsubscribe()
    }
  }, [loadHistory])

  // Computed on every render (small list) so just-deleted items are filtered out
  // even when this panel is served from the router cache without a refetch.
  const recentFiles = [...files]
    .filter((file) => !isHistoryItemDeleted(file.id))
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)

  return (
    <motion.section className="mt-8 border-t border-border px-1 pb-5 pt-5" variants={m.fadeUp} initial="hidden" animate="show">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-foreground">Recent files</h2>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">Your latest processed batches.</p>
        </div>
        <Link href="/history" className="inline-flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary">
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.div key="loading" variants={m.fadeScale} initial="hidden" animate="show" exit="exit">
            <WorkspaceActivityIndicator
              title="Refreshing recent documents"
              detail="Checking the latest batches and their review status."
            />
          </motion.div>
        ) : recentFiles.length === 0 ? (
          <motion.div
            key="empty"
            variants={m.fadeScale}
            initial="hidden"
            animate="show"
            exit="exit"
            className="rounded-md border border-dashed border-border bg-card px-4 py-5 text-sm font-medium text-foreground"
          >
            No documents yet
          </motion.div>
        ) : (
          <motion.div
            key="files"
            variants={m.staggerParent(0.035)}
            initial="hidden"
            animate="show"
            exit="exit"
            className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card"
          >
            {recentFiles.map((file) => (
              <MotionLink
                key={file.id}
                href={`/dashboard/client?job_id=${file.id}`}
                variants={m.listItem}
                whileHover={m.reduced ? undefined : { x: 2 }}
                whileTap={m.reduced ? undefined : { scale: 0.992 }}
                transition={m.springSnappy}
                className="ax-interactive flex items-center gap-3 px-3 py-3 hover:bg-accent/50"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-black">
                  <FileText className="size-4 text-black" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-foreground">{file.filename}</span>
                  <span className="ax-data-date mt-0.5 block text-xs">
                    {format(new Date(file.createdAt), "MMM d, yyyy")}
                  </span>
                </span>
                <StatusBadge tone={fileStatusTone(file.status)} className="hidden shrink-0 sm:inline-flex">
                  {fileStatusLabel(file.status)}
                </StatusBadge>
              </MotionLink>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}

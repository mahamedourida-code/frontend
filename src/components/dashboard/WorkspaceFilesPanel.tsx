"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowRight, FileText } from "lucide-react"
import { ocrApi } from "@/lib/api-client"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"

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
  if (["processing", "pending", "queued"].includes(status)) return "Processing"
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

function SkeletonRows() {
  return (
    <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-3">
          <span className="size-8 shrink-0 rounded-md ax-skeleton" />
          <span className="flex-1 space-y-2">
            <span className="block h-3 w-1/2 rounded-md ax-skeleton" />
            <span className="block h-2.5 w-1/4 rounded-md ax-skeleton" />
          </span>
        </div>
      ))}
    </div>
  )
}

export function WorkspaceFilesPanel({ refreshKey }: { refreshKey?: string }) {
  const [files, setFiles] = useState<WorkspaceFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadFiles = async () => {
      setLoading(true)
      try {
        const response = await ocrApi.getHistory(50, 0)
        if (mounted) setFiles(normalizeFiles(response))
      } catch {
        if (mounted) setFiles([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadFiles()
    return () => {
      mounted = false
    }
  }, [refreshKey])

  const recentFiles = useMemo(() => (
    [...files]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 5)
  ), [files])

  return (
    <section className="mt-8 border-t border-border px-1 pb-5 pt-5">
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

      {loading ? (
        <SkeletonRows />
      ) : recentFiles.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-4 py-5 text-sm text-muted-foreground">
          Uploaded documents will appear here after processing.
        </div>
      ) : (
        <div className="divide-y divide-border overflow-hidden rounded-md border border-border bg-card">
          {recentFiles.map((file) => (
            <Link
              key={file.id}
              href="/history"
              className="ax-interactive flex items-center gap-3 px-3 py-3 hover:bg-accent/50"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <FileText className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{file.filename}</span>
                <span className="mt-0.5 block text-xs font-medium text-muted-foreground">
                  {format(new Date(file.createdAt), "MMM d, yyyy")}
                </span>
              </span>
              <StatusBadge tone={fileStatusTone(file.status)} className="hidden shrink-0 sm:inline-flex">
                {fileStatusLabel(file.status)}
              </StatusBadge>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ChevronDown, FileSpreadsheet, Grid2X2, List, MoreHorizontal } from "lucide-react"
import { ocrApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FileView = "grid" | "list"
type FileSort = "modified-desc" | "modified-asc"

type WorkspaceFile = {
  id: string
  filename: string
  status: string
  createdAt: string
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

export function WorkspaceFilesPanel({ refreshKey }: { refreshKey?: string }) {
  const [files, setFiles] = useState<WorkspaceFile[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<FileView>("grid")
  const [sort, setSort] = useState<FileSort>("modified-desc")

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

  const sortedFiles = useMemo(() => (
    [...files].sort((left, right) => {
      const delta = new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      return sort === "modified-desc" ? delta : -delta
    })
  ), [files, sort])

  return (
    <section className="mt-10 min-h-[400px] border-t border-border px-1 pb-8 pt-7">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-foreground">
          My files
          <span className="text-base font-medium text-muted-foreground">{sortedFiles.length}</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="surface"
            className="h-10 rounded-lg px-3 text-sm font-medium"
            onClick={() => setSort((current) => current === "modified-desc" ? "modified-asc" : "modified-desc")}
          >
            Last modified
            <ChevronDown className={cn("size-4 transition-transform", sort === "modified-asc" && "rotate-180")} />
          </Button>
          <Button asChild variant="surface" className="h-10 rounded-lg px-3 text-sm font-medium">
            <Link href="/history">
              All files
            </Link>
          </Button>
          <div className="flex overflow-hidden rounded-lg border border-border bg-card p-0.5 shadow-xs">
            <button
              type="button"
              aria-label="Grid view"
              className={cn("flex size-9 items-center justify-center rounded-md transition-colors", view === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
              onClick={() => setView("grid")}
            >
              <Grid2X2 className="size-4" />
            </button>
            <button
              type="button"
              aria-label="List view"
              className={cn("flex size-9 items-center justify-center rounded-md transition-colors", view === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
              onClick={() => setView("list")}
            >
              <List className="size-4" />
            </button>
          </div>
          <Button variant="ghost" size="icon" asChild className="size-10 rounded-lg">
            <Link href="/history" aria-label="Open history">
              <MoreHorizontal className="size-5 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[150px] items-center justify-center text-sm font-medium text-muted-foreground">
          Loading files
        </div>
      ) : sortedFiles.length === 0 ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-center">
          <Image src="/icons/upload-cloud.png" alt="" width={56} height={56} className="object-contain opacity-80" loading="lazy" />
          <p className="text-sm font-medium text-muted-foreground">Converted batches appear here.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sortedFiles.map((file) => (
            <Link
              key={file.id}
              href="/history"
              className="ax-interactive ax-row-enter flex min-h-[84px] items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs hover:bg-accent/55"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <FileSpreadsheet className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{file.filename}</span>
                <span className="mt-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span>{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
                  <span className="capitalize">{file.status.replace(/_/g, " ")}</span>
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          {sortedFiles.map((file) => (
            <Link
              key={file.id}
              href="/history"
              className="ax-interactive flex items-center gap-4 border-b border-border px-4 py-3 last:border-0 hover:bg-accent/55"
            >
              <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{file.filename}</span>
              <span className="hidden text-xs font-medium capitalize text-muted-foreground sm:block">
                {file.status.replace(/_/g, " ")}
              </span>
              <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                {format(new Date(file.createdAt), "MMM d, yyyy")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}

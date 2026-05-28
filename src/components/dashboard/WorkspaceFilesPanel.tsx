"use client"

import { type ComponentType, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { ChevronDown, FileImage, FileSpreadsheet, FileText, Grid2X2, List, MoreHorizontal, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { ocrApi } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { StatusBadge, type StatusTone } from "@/components/dashboard/StatusBadge"
import { cn } from "@/lib/utils"

type FileView = "grid" | "list"
type FileSort = "modified-desc" | "modified-asc"

type WorkspaceFile = {
  id: string
  filename: string
  status: string
  createdAt: string
}

type FileInfo = {
  Icon: ComponentType<{ className?: string }>
  label: string
  bg: string
  fg: string
}

function getFileInfo(filename: string): FileInfo {
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  if (ext === "pdf")
    return { Icon: FileText, label: "PDF", bg: "bg-rose-50 dark:bg-rose-950", fg: "text-rose-500 dark:text-rose-400" }
  if (["png", "jpg", "jpeg", "webp", "gif", "tiff", "bmp"].includes(ext))
    return { Icon: FileImage, label: "IMAGE", bg: "bg-sky-50 dark:bg-sky-950", fg: "text-sky-500 dark:text-sky-400" }
  if (["xlsx", "xls", "csv", "ods"].includes(ext))
    return { Icon: FileSpreadsheet, label: "XLSX", bg: "bg-emerald-50 dark:bg-emerald-950", fg: "text-emerald-600 dark:text-emerald-400" }
  return { Icon: FileText, label: "FILE", bg: "bg-muted", fg: "text-muted-foreground" }
}

function fileStatusTone(status: string): StatusTone {
  if (status === "completed") return "success"
  if (["processing", "pending", "queued"].includes(status)) return "processing"
  if (["failed", "error"].includes(status)) return "error"
  if (status === "requires_review") return "review"
  return "neutral"
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
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <span className="size-9 shrink-0 rounded-lg ax-skeleton" />
            <span className="flex-1 space-y-2">
              <span className="block h-3 w-2/3 rounded-md ax-skeleton" />
              <span className="block h-2.5 w-1/3 rounded-md ax-skeleton" />
            </span>
            <span className="hidden h-5 w-16 shrink-0 rounded-full ax-skeleton sm:block" />
          </div>
        ))}
      </div>
      <div className="border-t border-border bg-card/95 px-4 py-2">
        <span className="block h-2.5 w-16 rounded-md ax-skeleton" />
      </div>
    </div>
  )
}

function DropZone() {
  const [isDragging, setIsDragging] = useState(false)
  const dragCount = useRef(0)

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    dragCount.current++
    if (dragCount.current === 1) setIsDragging(true)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const onDragLeave = () => {
    dragCount.current--
    if (dragCount.current === 0) setIsDragging(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    dragCount.current = 0
    setIsDragging(false)
  }

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl"
      style={{ minHeight: 220 }}
      animate={
        isDragging
          ? { scale: 1.02, boxShadow: "0 0 0 2px hsl(var(--primary))" }
          : { scale: 1, boxShadow: "0 0 0 0px hsl(var(--primary))" }
      }
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full text-primary" aria-hidden>
        <rect
          width="100%"
          height="100%"
          rx="16"
          ry="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          strokeOpacity={isDragging ? 0.8 : 0.4}
          style={{ animation: "ax-march 2s linear infinite", transition: "stroke-opacity 0.2s ease" }}
        />
      </svg>

      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-200"
        style={{
          background: "radial-gradient(ellipse at 50% 60%, hsl(var(--primary)/.06), transparent 68%)",
          opacity: isDragging ? 1.5 : 1,
        }}
      />

      <div className="relative flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
        <div className="relative flex items-center justify-center">
          <motion.div
            className="absolute rounded-full bg-primary/10"
            style={{ width: 60, height: 60 }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          <Upload className={cn("relative size-10 transition-colors duration-200", isDragging ? "text-primary" : "text-primary/60")} />
        </div>

        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            {isDragging ? "Release to upload" : "Drop files here"}
          </p>
          <p className="text-sm text-muted-foreground">PDF, PNG, JPEG, WebP — up to 50 files</p>
        </div>

        <Button asChild variant="surface" className="mt-1 h-9 rounded-lg px-4 text-sm font-medium">
          <Link href="/dashboard/client#upload-files">Browse files</Link>
        </Button>
      </div>
    </motion.div>
  )
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
            <Link href="/history">All files</Link>
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
        <SkeletonRows />
      ) : sortedFiles.length === 0 ? (
        <DropZone />
      ) : view === "grid" ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sortedFiles.map((file) => {
              const { Icon, label, bg, fg } = getFileInfo(file.filename)
              const tone = fileStatusTone(file.status)
              const isShimmering = tone === "processing"
              return (
                <Link
                  key={file.id}
                  href="/history"
                  className={cn(
                    "ax-interactive ax-row-enter relative flex min-h-[84px] items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs hover:bg-accent/55",
                    isShimmering && "overflow-hidden"
                  )}
                >
                  {isShimmering && (
                    <span className="pointer-events-none absolute inset-0 rounded-xl ax-skeleton opacity-30" />
                  )}
                  <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-lg", bg)}>
                    <Icon className={cn("size-5", fg)} />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">{file.filename}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-muted-foreground">{format(new Date(file.createdAt), "MMM d, yyyy")}</span>
                      <StatusBadge tone={tone}>
                        <span className="text-[10px] uppercase tracking-wider">{label}</span>
                      </StatusBadge>
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
          <div className="mt-3 border-t border-border pt-2.5">
            <span className="text-xs text-muted-foreground">
              {sortedFiles.length} file{sortedFiles.length === 1 ? "" : "s"}
            </span>
          </div>
        </>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="divide-y divide-border">
            {sortedFiles.map((file) => {
              const { Icon, label, bg, fg } = getFileInfo(file.filename)
              const tone = fileStatusTone(file.status)
              const isShimmering = tone === "processing"
              return (
                <Link
                  key={file.id}
                  href="/history"
                  className={cn(
                    "ax-interactive relative flex items-center gap-3 px-4 py-3 hover:bg-accent/55",
                    isShimmering && "overflow-hidden"
                  )}
                >
                  {isShimmering && (
                    <span className="pointer-events-none absolute inset-0 ax-skeleton opacity-25" />
                  )}
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", bg)}>
                    <Icon className={cn("size-4", fg)} />
                  </span>
                  <span className="relative min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{file.filename}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {format(new Date(file.createdAt), "MMM d, yyyy")}
                    </span>
                  </span>
                  <StatusBadge tone={tone} className="hidden shrink-0 sm:inline-flex">
                    <span className="text-[10px] uppercase tracking-wider">{label}</span>
                  </StatusBadge>
                </Link>
              )
            })}
          </div>
          <div className="sticky bottom-0 border-t border-border bg-card/95 px-4 py-2.5 backdrop-blur">
            <span className="text-xs text-muted-foreground">
              {sortedFiles.length} file{sortedFiles.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      )}
    </section>
  )
}

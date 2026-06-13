"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { markHistoryItemsDeleted } from "@/lib/recent-files-store"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table"
import { ArrowUpDown, Download, RefreshCw, FileSpreadsheet, FileText, FileImage, Calendar, DownloadCloud, Trash2, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InlineAction } from "@/components/ui/inline-action"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, formatDistanceToNow, subDays, isAfter, startOfDay } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useHistory } from "@/hooks/useHistory"
import type { HistoryJob } from "@/hooks/useHistory"
import { clientIntakeApi, ocrApi } from "@/lib/api-client"
import { useWorkspaces } from "@/hooks/useWorkspaces"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { EmptyState } from "@/components/dashboard/EmptyState"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Symbol } from "@/components/dashboard/Symbol"
import { SkeletonTableRow } from "@/components/dashboard/SkeletonCard"
import { StatusBadge } from "@/components/dashboard/StatusBadge"

function getFileTypeInfo(filename: string | null | undefined) {
  const ext = filename?.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return { Icon: FileText, bg: "bg-rose-500/10", fg: "text-rose-600 dark:text-rose-400" }
  if (["png", "jpg", "jpeg", "webp", "gif", "tiff"].includes(ext || ""))
    return { Icon: FileImage, bg: "bg-sky-500/10", fg: "text-sky-600 dark:text-sky-400" }
  return { Icon: FileSpreadsheet, bg: "bg-primary/10", fg: "text-primary" }
}

// Resolve the job identifier the delete endpoint expects. Saved-history rows
// carry it on original_job_id; fall back to job_id / id so failed and cancelled
// rows (which may not have original_job_id populated) can still be removed.
function resolveJobId(job: HistoryJob): string | null {
  return job.original_job_id || job.job_id || job.id || null
}

function historyStatusTone(status: string | null | undefined): "success" | "error" | "processing" | "info" | "neutral" {
  if (status === "completed" || status === "partially_completed") return "success"
  if (status === "failed") return "error"
  if (status === "processing") return "processing"
  if (status === "queued") return "info"
  return "neutral"
}

function HistoryContent() {
  const { user } = useAuth()
  const { activeWorkspace } = useWorkspaces(user)
  const { jobs, isLoading, error, refresh } = useHistory()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [dateFilter, setDateFilter] = React.useState<"today" | "week" | "month" | "custom" | null>(null)
  const [focusedRowId, setFocusedRowId] = React.useState<string | null>(null)

  // P11 — client filter from the dashboard Clients tab
  const clientId = searchParams.get("client")
  const clientName = searchParams.get("clientName")
  const [clientJobIds, setClientJobIds] = React.useState<Set<string> | null>(null)
  React.useEffect(() => {
    if (!clientId || !activeWorkspace?.id) {
      setClientJobIds(null)
      return
    }
    void clientIntakeApi.analytics(activeWorkspace.id)
      .then((response) => {
        const match = response.clients.find((c) => c.link_id === clientId)
        setClientJobIds(new Set(match?.job_ids || []))
      })
      .catch(() => setClientJobIds(new Set()))
  }, [clientId, activeWorkspace?.id])

  // Filter jobs by date (and by client when a client filter is active)
  const filteredJobs = React.useMemo(() => {
    const base = clientJobIds
      ? jobs.filter(job => clientJobIds.has(String(job.original_job_id || "")) || clientJobIds.has(String(job.id || "")))
      : jobs
    if (!dateFilter && !date) return base

    return base.filter(job => {
      const jobDate = new Date(job.saved_at || job.created_at || '')
      const today = startOfDay(new Date())
      
      if (dateFilter === "today") {
        return startOfDay(jobDate).getTime() === today.getTime()
      } else if (dateFilter === "week") {
        const weekAgo = subDays(today, 7)
        return isAfter(jobDate, weekAgo) || startOfDay(jobDate).getTime() === weekAgo.getTime()
      } else if (dateFilter === "month") {
        const monthAgo = subDays(today, 30)
        return isAfter(jobDate, monthAgo) || startOfDay(jobDate).getTime() === monthAgo.getTime()
      } else if (date) {
        // Custom date selected
        return startOfDay(jobDate).getTime() === startOfDay(date).getTime()
      }
      
      return true
    })
  }, [jobs, dateFilter, date, clientJobIds])

  const handleDownload = async (job: HistoryJob) => {
    try {
      let blob: Blob;
      
// Debug log
      
      // Simply use result_url if available (it's a signed URL)
      if (job.result_url) {
        // Try direct download if result_url is a signed URL
// Debug log
        
        if (job.result_url.includes('supabase') && job.result_url.includes('token=')) {
          // This is likely a signed URL, fetch directly
// Debug log
          const response = await fetch(job.result_url);
          if (!response.ok) {
            throw new Error('Download failed');
          }
          blob = await response.blob();
        } else {
          // Legacy download from local storage
          const fileId = job.result_url.includes('supabase')
            ? job.result_url.split('/').pop()
            : job.result_url.replace('/api/v1/download/', '')

          if (!fileId) {
            toast.error('Invalid download URL')
            return
          }

          blob = await ocrApi.downloadFile(fileId)
        }
      } else {
        toast.error('No download URL available')
        return
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = job.filename || `job_${job.original_job_id || job.id}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('File downloaded')
    } catch (err: any) {
      toast.error(err.detail || 'Download failed')
    }
  }



  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const columns: ColumnDef<HistoryJob>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "thumbnail",
      header: () => null,
      cell: ({ row }) => {
        const { Icon, bg, fg } = getFileTypeInfo(row.original.filename)
        return (
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg", bg)}>
            <Icon className={cn("size-5", fg)} />
          </div>
        )
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "filename",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Filename
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const filename = (row.getValue("filename") as string | null) || "Untitled"
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="block max-w-[220px] cursor-default truncate text-sm font-medium text-foreground">
                {filename}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs break-all">
              {filename}
            </TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      accessorKey: "saved_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const rawDate = row.original.saved_at || row.original.created_at
        if (!rawDate) return <span className="text-xs text-muted-foreground">—</span>
        const relative = formatDistanceToNow(new Date(rawDate), { addSuffix: true })
        const absolute = formatDate(rawDate)
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-sm text-muted-foreground">{relative}</span>
            </TooltipTrigger>
            <TooltipContent side="top">{absolute}</TooltipContent>
          </Tooltip>
        )
      },
    },
    {
      id: "status",
      header: () => <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</span>,
      cell: ({ row }) => {
        const status = row.original.status
        const label = status === "completed" ? "Ready" : (status?.replace(/_/g, " ") || "Unknown")
        return <StatusBadge tone={historyStatusTone(status)}>{label}</StatusBadge>
      },
      enableSorting: false,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const job = row.original
        const isDownloadable = job.status === "completed" && job.result_url
        const isDismissable = job.status === "failed" || job.status === "cancelled"
        const onDelete = () => {
          const jobId = resolveJobId(job)
          if (jobId) handleDelete(jobId, job)
          else toast.error("No job ID available")
        }
        return (
          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
            {isDownloadable && (
              <Button
                variant="surface"
                size="sm"
                onClick={() => handleDownload(job)}
                className="h-8 px-3"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
            )}
            {isDownloadable || isDismissable ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="h-8 px-3"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">Processing…</span>
            )}
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: filteredJobs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

  React.useEffect(() => {
    if (!focusedRowId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Delete") return
      const row = table.getRowModel().rows.find(r => r.id === focusedRowId)
      if (!row) return
      const job = row.original
      const jobId = resolveJobId(job)
      if (!jobId) return
      if (window.confirm(`Delete "${job.filename || "this file"}"? This cannot be undone.`)) {
        void handleDelete(jobId)
        setFocusedRowId(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [focusedRowId, table])

  const handleBulkDownload = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.error('No files selected')
      return
    }

    const completedJobs = selectedRows
      .map((row) => row.original)
      .filter((job) => job.status === 'completed' && job.result_url)

    if (completedJobs.length === 0) {
      toast.error('No completed files available for download')
      return
    }

    toast.info(`Downloading ${completedJobs.length} file(s)...`)

    // Download files sequentially with a small delay to prevent browser blocking
    for (const job of completedJobs) {
      await handleDownload(job)
      await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay between downloads
    }
  }

  const handleDownloadAll = async () => {
    const completedJobs = filteredJobs.filter(
      (job) => job.status === 'completed' && job.result_url
    )

    if (completedJobs.length === 0) {
      toast.error('No completed files available for download')
      return
    }

    toast.info(`Downloading all ${completedJobs.length} completed file(s)...`)

    // Download files sequentially with a small delay to prevent browser blocking
    for (const job of completedJobs) {
      await handleDownload(job)
      await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay between downloads
    }
  }

  const handleDelete = async (jobId: string, job?: any) => {
    try {
      const response = await ocrApi.deleteFromHistory(jobId)
      if (response.success) {
        toast.success('File deleted successfully')
        // Hide it from any other list (e.g. dashboard "Recent files") right away,
        // matching whichever id field that list keyed the row on.
        markHistoryItemsDeleted([jobId, job?.id, job?.job_id, job?.original_job_id])
        refresh() // Refresh the list after deletion
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('axliner:history-changed'))
      }
    } catch (err: any) {
      toast.error(err.detail || 'Failed to delete file')
    }
  }

  const handleBulkDelete = async () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) {
      toast.error('No files selected')
      return
    }

    if (!confirm(`Are you sure you want to delete ${selectedRows.length} selected file(s)? This action cannot be undone.`)) {
      return
    }

    const selectedJobs = selectedRows.map((row) => row.original)
    let successCount = 0
    let errorCount = 0

    toast.info(`Deleting ${selectedJobs.length} file(s)...`)

    // Delete files sequentially
    const deletedIds: Array<string | undefined | null> = []
    for (const job of selectedJobs) {
      try {
        // Use original_job_id which is the actual job ID from processing
        const jobId = resolveJobId(job)
        if (!jobId) {
          errorCount++
          continue
        }
        const response = await ocrApi.deleteFromHistory(jobId)
        if (response.success) {
          successCount++
          deletedIds.push(jobId, job.id, job.job_id, job.original_job_id)
        } else {
          errorCount++
        }
      } catch (err) {
        errorCount++
      }
    }
    if (deletedIds.length) markHistoryItemsDeleted(deletedIds)

    // Clear selection after deletion
    table.resetRowSelection()

    // Show results
    if (successCount > 0) {
      toast.success(`Deleted ${successCount} file(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}`)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('axliner:history-changed'))
    }
    if (errorCount > 0 && successCount === 0) {
      toast.error(`Failed to delete ${errorCount} file(s)`)
    }

    // Refresh the list
    refresh()
  }

  const handleDeleteAll = async () => {
    if (!confirm('Are you sure you want to delete all saved files? This action cannot be undone.')) {
      return
    }

    try {
      const response = await ocrApi.deleteAllFromHistory()
      if (response.success) {
        toast.success(`Deleted ${response.deleted_count} file(s)`)
        refresh() // Refresh the list after deletion
      }
    } catch (err: any) {
      toast.error(err.detail || 'Failed to delete files')
    }
  }

  return (
    <DashboardShell
      activeItem="history"
      title="Saved Files"
      user={user}
    >
        <PageHeader
          title="Saved Files"
          actions={
            <InlineAction onClick={refresh} disabled={isLoading}>
              <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
              Refresh
            </InlineAction>
          }
        />

        {/* P11 — client filter chip */}
        {clientId && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-sm">
            <span className="font-medium text-foreground">
              Filtered to <span className="text-primary">{clientName || "client"}</span>
              {clientJobIds ? ` · ${filteredJobs.length} file${filteredJobs.length === 1 ? "" : "s"}` : " · loading…"}
            </span>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => router.push("/history")}>
              Clear filter
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-3 lg:mb-4 p-2 lg:p-3 rounded-md border border-destructive/50 bg-destructive/10">
            <p className="text-xs lg:text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Export-ready accent — spreadsheets to download, journals to post */}
        {!isLoading && filteredJobs.filter(job => job.status === "completed" && job.result_url).length > 0 && (
          <div className="mb-4 flex items-center gap-4">
            <Symbol name="success-exported-excel" size="inline" className="h-16 w-16 sm:h-20 sm:w-20" />
            <div className="min-w-0">
              <p className="text-[15px] font-bold tracking-tight text-foreground">
                {filteredJobs.filter(job => job.status === "completed" && job.result_url).length} file
                {filteredJobs.filter(job => job.status === "completed" && job.result_url).length === 1 ? "" : "s"} ready to export
              </p>
              <p className="mt-0.5 text-sm font-normal text-foreground">
                Download the reviewed spreadsheets, or reopen a batch to post its journal entries.
              </p>
            </div>
            <Symbol name="code-journal-entry" size="inline" className="ml-auto hidden h-16 w-16 sm:block sm:h-20 sm:w-20" />
          </div>
        )}

        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-3 lg:mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-4 w-full lg:w-auto">
            {/* Date Filter */}
            <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto w-full sm:w-auto">
              <Button
                variant="surface"
                size="sm"
                onClick={() => {
                  setDateFilter("today")
                  setDate(undefined)
                }}
                className={cn(
                  "h-8 text-xs flex-shrink-0 ax-interactive",
                  dateFilter === "today" && "text-[var(--brand-link)] ring-1 ring-[var(--brand-link)]"
                )}
              >
                Today
              </Button>
              <Button
                variant="surface"
                size="sm"
                onClick={() => {
                  setDateFilter("week")
                  setDate(undefined)
                }}
                className={cn(
                  "h-8 text-xs flex-shrink-0 ax-interactive",
                  dateFilter === "week" && "text-[var(--brand-link)] ring-1 ring-[var(--brand-link)]"
                )}
              >
                7D
              </Button>
              <Button
                variant="surface"
                size="sm"
                onClick={() => {
                  setDateFilter("month")
                  setDate(undefined)
                }}
                className={cn(
                  "h-8 text-xs flex-shrink-0 ax-interactive",
                  dateFilter === "month" && "text-[var(--brand-link)] ring-1 ring-[var(--brand-link)]"
                )}
              >
                30D
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="surface"
                    size="sm"
                    className={cn(
                      "ax-interactive h-8 w-[120px] lg:w-[180px] justify-start text-left font-normal text-xs flex-shrink-0",
                      date ? "text-[var(--brand-link)] ring-1 ring-[var(--brand-link)]" : "text-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 lg:mr-2 h-3 w-3 lg:h-4 lg:w-4" />
                    <span className="hidden sm:inline">{date ? format(date, "PPP") : "Pick a date"}</span>
                    <span className="sm:hidden">{date ? format(date, "MMM d") : "Date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate)
                      setDateFilter(null)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {(dateFilter || date) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFilter(null)
                    setDate(undefined)
                  }}
                  className="h-8 px-2 text-xs flex-shrink-0"
                >
                  Clear
                </Button>
              )}
            </div>
            {/* Selected files actions */}
            {table.getFilteredSelectedRowModel().rows.length > 0 && (
              <div className="flex items-center gap-1 lg:gap-2">
                <span className="text-xs lg:text-sm text-muted-foreground">
                  {table.getFilteredSelectedRowModel().rows.length} selected
                </span>
                <Button
                  variant="surface"
                  size="sm"
                  onClick={handleBulkDownload}
                  className="h-8 text-xs"
                >
                  <DownloadCloud className="h-3 w-3 lg:mr-1" />
                  <span className="hidden lg:inline">Download</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8 text-xs"
                >
                  <Trash2 className="h-3 w-3 lg:mr-1" />
                  <span className="hidden lg:inline">Delete</span>
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 lg:gap-2 w-full lg:w-auto justify-between lg:justify-end">
            {/* Download all button */}
            {filteredJobs.filter(job => job.status === 'completed' && job.result_url).length > 0 && (
              <>
                <Button
                  variant="ink"
                  size="sm"
                  onClick={handleDownloadAll}
                  className="h-8 text-xs"
                >
                  <DownloadCloud className="h-3 w-3 lg:mr-1" />
                  <span className="hidden sm:inline">All ({filteredJobs.filter(job => job.status === 'completed').length})</span>
                  <span className="sm:hidden">All</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="h-8 text-xs"
                >
                  <Trash2 className="h-3 w-3 lg:mr-1" />
                  <span className="hidden sm:inline">Delete All</span>
                  <span className="sm:hidden">Clear</span>
                </Button>
              </>
            )}
            <p className="text-xs lg:text-sm text-muted-foreground">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            </p>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-10">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonTableRow key={`skeleton-${index}`} columns={columns.length} />
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "h-12 cursor-pointer transition-colors",
                      focusedRowId === row.id && "bg-accent/40"
                    )}
                    onClick={() => setFocusedRowId(prev => prev === row.id ? null : row.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="py-10">
                    <EmptyState
                      icon={<FileSpreadsheet />}
                      illustration="/symbols/filing-cabinet.png"
                      illustrationSize={260}
                      eyebrow="Archive"
                      title="No saved files yet"
                      description="Reviewed batches you export land in this cabinet — every spreadsheet and journal, ready to reopen."
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="surface"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8"
            >
              Previous
            </Button>
            <Button
              variant="surface"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8"
            >
              Next
            </Button>
          </div>
        )}
    </DashboardShell>
  )
}

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace('/sign-in?next=%2Fhistory')
    }
  }, [user, loading, router])

  if (loading) {
    return <DashboardRouteLoader label="Loading history" />
  }

  if (!user) {
    return null
  }

  return <HistoryContent />
}

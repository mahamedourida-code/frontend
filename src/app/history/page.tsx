"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { ArrowUpDown, Download, ArrowLeft, RefreshCw, FileSpreadsheet, Calendar, DownloadCloud, Trash2, AlertTriangle, CalendarIcon, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, subDays, isAfter, startOfDay } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useHistory } from "@/hooks/useHistory"
import { ocrApi } from "@/lib/api-client"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import { AppIcon } from "@/components/AppIcon"
import { MobileNav } from "@/components/MobileNav"

import { Database } from '@/types/database.generated'

type HistoryJob = Database['public']['Tables']['job_history']['Row']

function HistoryContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { jobs, isLoading, error, refresh } = useHistory()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [date, setDate] = React.useState<Date | undefined>(undefined)
  const [dateFilter, setDateFilter] = React.useState<"today" | "week" | "month" | "custom" | null>(null)

  // Filter jobs by date
  const filteredJobs = React.useMemo(() => {
    if (!dateFilter && !date) return jobs

    return jobs.filter(job => {
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
  }, [jobs, dateFilter, date])

  const handleDownload = async (job: HistoryJob) => {
    try {
      let blob: Blob;
      
      console.log('Downloading job:', job); // Debug log
      
      // Simply use result_url if available (it's a signed URL)
      if (job.result_url) {
        // Try direct download if result_url is a signed URL
        console.log('Using result_url:', job.result_url); // Debug log
        
        if (job.result_url.includes('supabase') && job.result_url.includes('token=')) {
          // This is likely a signed URL, fetch directly
          console.log('Fetching signed result_url directly'); // Debug log
          const response = await fetch(job.result_url);
          if (!response.ok) {
            console.error('Result URL fetch failed:', response.status, response.statusText);
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
        console.error('No download URL available. Job data:', job);
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
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "filename",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Filename
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const filename = row.getValue("filename") as string | null
        return (
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{filename || 'Untitled'}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "saved_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2"
          >
            Date
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        )
      },
      cell: ({ row }) => {
        // Use saved_at if available, otherwise fall back to created_at
        const date = (row.original as any).saved_at || (row.original as any).created_at
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(date)}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const job = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            {job.status === 'completed' && job.result_url ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(job)}
                  className="h-8 px-3"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const jobId = job.original_job_id
                    if (jobId) {
                      handleDelete(jobId)
                    } else {
                      toast.error('No job ID available')
                    }
                  }}
                  className="h-8 px-3 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </>
            ) : job.status === 'failed' ? (
              <span className="text-xs text-destructive">Failed</span>
            ) : (
              <span className="text-xs text-muted-foreground">Processing...</span>
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

  const handleDelete = async (jobId: string) => {
    try {
      const response = await ocrApi.deleteFromHistory(jobId)
      if (response.success) {
        toast.success('File deleted successfully')
        refresh() // Refresh the list after deletion
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
    for (const job of selectedJobs) {
      try {
        // Use original_job_id which is the actual job ID from processing
        const jobId = job.original_job_id
        if (!jobId) {
          errorCount++
          continue
        }
        const response = await ocrApi.deleteFromHistory(jobId)
        if (response.success) {
          successCount++
        } else {
          errorCount++
        }
      } catch (err) {
        errorCount++
      }
    }

    // Clear selection after deletion
    table.resetRowSelection()

    // Show results
    if (successCount > 0) {
      toast.success(`Deleted ${successCount} file(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}`)
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
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-3 lg:px-4 py-2 lg:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="hidden sm:flex items-center gap-2 lg:gap-4">
                <AppIcon size={24} className="lg:w-7 lg:h-7" />
                <div className="border-l h-6" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/dashboard')}
                className="h-8 w-8 lg:h-9 lg:w-9"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-base lg:text-lg font-semibold flex items-center gap-2">
                <History className="h-4 w-4 lg:hidden" />
                Saved Files
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
              className="h-8 w-8 lg:h-9 lg:w-9"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 lg:px-4 py-4 lg:py-6">
        {/* Error State */}
        {error && (
          <div className="mb-3 lg:mb-4 p-2 lg:p-3 rounded-md border border-destructive/50 bg-destructive/10">
            <p className="text-xs lg:text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Table Controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 mb-3 lg:mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 lg:gap-4 w-full lg:w-auto">
            {/* Date Filter */}
            <div className="flex items-center gap-1 lg:gap-2 overflow-x-auto w-full sm:w-auto">
              <Button
                variant={dateFilter === "today" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDateFilter("today")
                  setDate(undefined)
                }}
                className="h-8 text-xs flex-shrink-0"
              >
                Today
              </Button>
              <Button
                variant={dateFilter === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDateFilter("week")
                  setDate(undefined)
                }}
                className="h-8 text-xs flex-shrink-0"
              >
                7D
              </Button>
              <Button
                variant={dateFilter === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setDateFilter("month")
                  setDate(undefined)
                }}
                className="h-8 text-xs flex-shrink-0"
              >
                30D
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={date ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-8 w-[120px] lg:w-[180px] justify-start text-left font-normal text-xs flex-shrink-0",
                      !date && "text-muted-foreground"
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
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDownload}
                  className="h-8 text-xs"
                >
                  <DownloadCloud className="h-3 w-3 lg:mr-1" />
                  <span className="hidden lg:inline">Download</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="h-8 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadAll}
                  className="h-8 text-xs"
                >
                  <DownloadCloud className="h-3 w-3 lg:mr-1" />
                  <span className="hidden sm:inline">All ({filteredJobs.filter(job => job.status === 'completed').length})</span>
                  <span className="sm:hidden">All</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteAll}
                  className="h-8 text-xs text-destructive hover:bg-destructive hover:text-destructive-foreground"
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
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading saved files...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="h-12"
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
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">No saved files yet</p>
                      <p className="text-xs text-muted-foreground">
                        Save processed files to see them here
                      </p>
                    </div>
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
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="h-8"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="h-8"
            >
              Next
            </Button>
          </div>
        )}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNav 
        isAuthenticated={true}
        user={{
          email: user?.email,
          name: user?.user_metadata?.full_name
        }}
      />
    </div>
  )
}

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/sign-in')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <HistoryContent />
}

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
} from "@tanstack/react-table"
import { ArrowUpDown, Download, ArrowLeft, RefreshCw, FileSpreadsheet, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useHistory } from "@/hooks/useHistory"
import { ocrApi } from "@/lib/api-client"
import { toast } from "sonner"

interface HistoryJob {
  job_id: string
  filename: string
  status: string
  result_url: string | null
  created_at: string
  updated_at: string
  metadata: any
}

function HistoryContent() {
  const router = useRouter()
  const { jobs, isLoading, error, refresh } = useHistory()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const handleDownload = async (job: HistoryJob) => {
    try {
      let blob: Blob;
      
      // Check if we have storage files in metadata (new format with Supabase Storage)
      const storageFiles = job.metadata?.storage_files;
      if (storageFiles && storageFiles.length > 0) {
        // Download from Supabase Storage using storage path
        const storagePath = storageFiles[0].storage_path;
        blob = await ocrApi.downloadFromStorage(storagePath);
      } else if (job.result_url) {
        // Legacy download from local storage
        const fileId = job.result_url.includes('supabase')
          ? job.result_url.split('/').pop()
          : job.result_url.replace('/api/v1/download/', '')

        if (!fileId) {
          toast.error('Invalid download URL')
          return
        }

        blob = await ocrApi.downloadFile(fileId)
      } else {
        toast.error('No download URL available')
        return
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = job.filename || `job_${job.job_id}.xlsx`
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
        const filename = row.getValue("filename") as string
        return (
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{filename}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        const variants: Record<string, any> = {
          completed: "default",
          failed: "destructive",
          processing: "secondary",
          pending: "outline"
        }
        return (
          <Badge variant={variants[status] || "outline"} className="text-xs">
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "metadata",
      header: "Images",
      cell: ({ row }) => {
        const metadata = row.getValue("metadata") as any
        const count = metadata?.total_images || 0
        return <span className="text-sm text-muted-foreground">{count}</span>
      },
    },
    {
      accessorKey: "created_at",
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
        const date = row.getValue("created_at") as string
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
          <div className="text-right">
            {job.status === 'completed' && (job.result_url || job.metadata?.storage_files) ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownload(job)}
                className="h-8 px-3"
              >
                <Download className="h-3 w-3 mr-1" />
                Download
              </Button>
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
    data: jobs,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="h-8"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="border-l h-6" />
              <h1 className="text-lg font-semibold">Processing History</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refresh}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 rounded-md border border-destructive/50 bg-destructive/10">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Table Controls */}
        <div className="flex items-center justify-between mb-4">
          <Input
            placeholder="Filter by filename..."
            value={(table.getColumn("filename")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("filename")?.setFilterValue(event.target.value)
            }
            className="max-w-sm h-9 text-sm"
          />
          <p className="text-sm text-muted-foreground">
            {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
          </p>
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
                      <span className="text-sm text-muted-foreground">Loading history...</span>
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
                      <p className="text-sm font-medium">No history yet</p>
                      <p className="text-xs text-muted-foreground">
                        Process some files to see them here
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {jobs.length > 0 && (
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
    </div>
  )
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  )
}

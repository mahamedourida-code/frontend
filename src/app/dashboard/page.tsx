"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { ocrApi } from "@/lib/api-client"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardMiniCharts } from "@/components/dashboard/DashboardMiniCharts"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  CalendarDays,
  ChevronDown,
  FileSpreadsheet,
  Grid2X2,
  List,
  MoreHorizontal,
  RefreshCw,
  Timer,
  TrendingUp,
  Upload
} from "lucide-react"

// Dynamic import for the Chart component to avoid SSR issues
const DashboardChart = dynamic(() => import("@/components/DashboardChart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[280px]">
      <div className="text-muted-foreground">Loading chart...</div>
    </div>
  )
})
import { format, subDays, subHours, startOfDay, endOfDay, eachDayOfInterval, eachHourOfInterval } from "date-fns"

type TimeRange = "1d" | "7d" | "30d" | "3m"
type FileView = "grid" | "list"
type FileSort = "modified-desc" | "modified-asc"

interface ProcessingMetadata {
  total_images?: number
  processing_time?: number
  [key: string]: any
}

interface Job {
  id: string
  user_id: string
  status: string
  created_at: string
  saved_at?: string
  updated_at?: string
  filename?: string
  original_job_id?: string
  result_url?: string
  requires_review?: boolean
  processing_metadata?: ProcessingMetadata
  [key: string]: any
}

interface ProcessingData {
  timestamp: Date
  count: number
  formattedDate?: string
  formattedTime?: string
}

interface DashboardStats {
  totalProcessed: number
  todayProcessed: number
  thisMonthProcessed: number
  monthProcessed: number
  lastWeekProcessed: number
  averageTime: number
  successRate: number
  selectedPeriodProcessed: number
  totalJobs: number
  activeJobs: number
  failedJobs: number
  successfulJobs: number
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [chartData, setChartData] = useState<ProcessingData[]>([])
  const [recentFiles, setRecentFiles] = useState<Job[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [fileView, setFileView] = useState<FileView>("grid")
  const [fileSort, setFileSort] = useState<FileSort>("modified-desc")
  const [stats, setStats] = useState<DashboardStats>({
    totalProcessed: 0,
    todayProcessed: 0,
    thisMonthProcessed: 0,
    monthProcessed: 0,
    lastWeekProcessed: 0,
    averageTime: 0,
    successRate: 0,
    selectedPeriodProcessed: 0,
    totalJobs: 0,
    activeJobs: 0,
    failedJobs: 0,
    successfulJobs: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    } else if (!authLoading && user) {
      fetchDashboardData()
      fetchFileLibrary()
    }
  }, [user?.id, authLoading, router])

  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchDashboardData()
    }
  }, [timeRange])

  const fetchDashboardData = async () => {
    if (!user) return

    setLoading(true)

    try {
      const dashboard = await ocrApi.getDashboard(timeRange)
      setChartData(
        (dashboard.chart || []).map((point: any) => ({
          ...point,
          timestamp: new Date(point.timestamp),
        }))
      )
      setStats({
        totalProcessed: dashboard.stats?.totalProcessed || 0,
        todayProcessed: dashboard.stats?.todayProcessed || 0,
        thisMonthProcessed: dashboard.stats?.thisMonthProcessed || 0,
        monthProcessed: dashboard.stats?.monthProcessed || 0,
        lastWeekProcessed: dashboard.stats?.lastWeekProcessed || 0,
        averageTime: dashboard.stats?.averageTime || 0,
        successRate: dashboard.stats?.successRate || 0,
        selectedPeriodProcessed: dashboard.stats?.selectedPeriodProcessed || 0,
        totalJobs: dashboard.stats?.totalJobs || 0,
        activeJobs: dashboard.stats?.activeJobs || 0,
        failedJobs: dashboard.stats?.failedJobs || 0,
        successfulJobs: dashboard.stats?.successfulJobs || 0,
      })
    } catch (error) {
      try {
        await fetchDashboardDataFromHistory()
      } catch {
        resetDashboardData()
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchFileLibrary = async () => {
    if (!user) return
    setFilesLoading(true)

    try {
      const historyResponse = await ocrApi.getHistory(50, 0)
      setRecentFiles(normalizeHistoryJobs(historyResponse))
    } catch {
      setRecentFiles([])
    } finally {
      setFilesLoading(false)
    }
  }

  const fetchDashboardDataFromHistory = async () => {
      // Calculate date range based on selected time
      const now = new Date()
      let fromDate: Date
      
      switch (timeRange) {
        case "1d":
          fromDate = subHours(now, 24)
          break
        case "7d":
          fromDate = subDays(now, 7)
          break
        case "30d":
          fromDate = subDays(now, 30)
          break
        case "3m":
          fromDate = subDays(now, 90)
          break
        default:
          fromDate = subDays(now, 7)
      }

      const historyResponse = await ocrApi.getHistory(500, 0)
      const allJobs = normalizeHistoryJobs(historyResponse)
      const typedJobs = allJobs
        .filter(job => new Date(job.created_at) >= fromDate)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      // Process data for chart
      const processedData = generateChartData(typedJobs, timeRange)
      setChartData(processedData)

      // Calculate stats
      const totalJobs = typedJobs.length
      const totalImages = typedJobs.reduce((sum, job) => {
        let metadata = job.processing_metadata
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata)
          } catch (e) {
            metadata = undefined
          }
        }
        return sum + (metadata?.total_images || 1)
      }, 0)
      
      // Get today's jobs
      const todayStart = startOfDay(now)
      const todayJobs = typedJobs.filter(job => 
        new Date(job.created_at) >= todayStart
      )
      const todayImages = todayJobs.reduce((sum, job) => {
        let metadata = job.processing_metadata
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata)
          } catch (e) {
            metadata = undefined
          }
        }
        return sum + (metadata?.total_images || 1)
      }, 0)
      
      // Calculate average processing time
      const processingTimes = typedJobs.map(job => {
        let metadata = job.processing_metadata
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata)
          } catch (e) {
            metadata = undefined
          }
        }
        if (metadata?.processing_time) {
          return metadata.processing_time
        }
        return 0
      }).filter(time => time > 0)
      
      const avgTime = processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0

      // Calculate success rate
      const successfulJobs = typedJobs.filter(job => job.status === 'completed').length
      const successRate = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0

      const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
      const monthJobs = allJobs.filter(job => new Date(job.created_at) >= monthStart)
      const thisMonthProcessed = monthJobs.reduce((sum, job) => {
        let metadata = job.processing_metadata
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata)
          } catch (e) {
            metadata = undefined
          }
        }
        return sum + (metadata?.total_images || 1)
      }, 0)
      
      // Calculate last week's processed
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const weekJobs = typedJobs.filter(job => 
        new Date(job.created_at) >= weekAgo
      )
      const lastWeekProcessed = weekJobs.reduce((sum, job) => {
        let metadata = job.processing_metadata
        if (typeof metadata === 'string') {
          try {
            metadata = JSON.parse(metadata)
          } catch (e) {
            metadata = undefined
          }
        }
        return sum + (metadata?.total_images || 1)
      }, 0)

      const newStats = {
        totalProcessed: allJobs.reduce((sum, job) => sum + getJobImageCount(job), 0) || totalImages,
        todayProcessed: todayImages,
        thisMonthProcessed: thisMonthProcessed,
        monthProcessed: thisMonthProcessed,
        lastWeekProcessed: lastWeekProcessed,
        averageTime: avgTime,
        successRate,
        selectedPeriodProcessed: totalImages,
        totalJobs: allJobs.length,
        activeJobs: allJobs.filter(job => ["queued", "processing"].includes(job.status)).length,
        failedJobs: typedJobs.filter(job => job.status === "failed").length,
        successfulJobs: successfulJobs,
      }
      setStats(newStats)
  }

  const getJobImageCount = (job: Job): number => {
    let metadata = job.processing_metadata
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata)
      } catch (e) {
        metadata = undefined
      }
    }
    return Number(metadata?.successful_images || metadata?.processed_images || metadata?.total_images || 1)
  }

  const resetDashboardData = () => {
      // Set default values on error
      setChartData([])
      setStats({
        totalProcessed: 0,
        todayProcessed: 0,
        thisMonthProcessed: 0,
        monthProcessed: 0,
        lastWeekProcessed: 0,
        averageTime: 0,
        successRate: 0,
        selectedPeriodProcessed: 0,
        totalJobs: 0,
        activeJobs: 0,
        failedJobs: 0,
        successfulJobs: 0,
      })
  }

  const normalizeHistoryJobs = (response: any): Job[] => {
    const rawJobs = Array.isArray(response)
      ? response
      : response?.jobs || response?.history || response?.items || response?.data || []

    return rawJobs.map((job: any) => ({
      ...job,
      id: job.id || job.job_id || job.original_job_id,
      created_at: job.created_at || job.saved_at || job.completed_at || new Date().toISOString(),
      status: job.status || 'completed',
      processing_metadata: job.processing_metadata || job.metadata || {
        total_images: job.total_images || job.successful_images || 1,
        processing_time: job.processing_time || job.processing_time_seconds,
      },
    }))
  }

  const generateChartData = (jobs: Job[], range: TimeRange): ProcessingData[] => {
    const now = new Date()
    let data: ProcessingData[] = []
    
    if (range === "1d") {
      // Last 24 hours - hourly data
      const hours = eachHourOfInterval({
        start: subHours(now, 24),
        end: now
      })
      
      data = hours.map(hour => {
        const hourJobs = jobs.filter(job => {
          const jobDate = new Date(job.created_at)
          return jobDate >= hour && jobDate < new Date(hour.getTime() + 60 * 60 * 1000)
        })
        
        const count = hourJobs.reduce((sum, job) => {
          // Handle case where metadata might be a string
          let metadata = job.processing_metadata
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata)
            } catch (e) {
              metadata = undefined
            }
          }
          return sum + (metadata?.total_images || 1)
        }, 0)
        
        return {
          timestamp: hour,
          count,
          formattedTime: format(hour, 'ha')
        }
      })
    } else {
      // Daily data for 7d, 30d, 3m
      const days = eachDayOfInterval({
        start: range === "7d" ? subDays(now, 7) : 
               range === "30d" ? subDays(now, 30) : 
               subDays(now, 90),
        end: now
      })
      
      data = days.map(day => {
        const dayJobs = jobs.filter(job => {
          const jobDate = new Date(job.created_at)
          return jobDate >= startOfDay(day) && jobDate <= endOfDay(day)
        })
        
        const count = dayJobs.reduce((sum, job) => {
          // Handle case where metadata might be a string
          let metadata = job.processing_metadata
          if (typeof metadata === 'string') {
            try {
              metadata = JSON.parse(metadata)
            } catch (e) {
              metadata = undefined
            }
          }
          return sum + (metadata?.total_images || 1)
        }, 0)
        
        return {
          timestamp: day,
          count,
          formattedDate: format(day, 'MMM d')
        }
      })
    }
    
    return data
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 size-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading dashboard</p>
        </div>
      </div>
    )
  }

  const averageTimeLabel = stats.averageTime > 0
    ? `${stats.averageTime.toFixed(1)}s`
    : stats.monthProcessed > 0
      ? "~5s"
      : "-"

  const metricCards = [
    {
      title: "Today",
      value: stats.todayProcessed,
      helper: "Files processed",
      icon: CalendarDays,
    },
    {
      title: "This month",
      value: stats.thisMonthProcessed,
      helper: "Monthly volume",
      icon: FileSpreadsheet,
    },
    {
      title: "Average time",
      value: averageTimeLabel,
      helper: "Per image",
      icon: Timer,
    },
    {
      title: "Total",
      value: stats.totalProcessed,
      helper: "All time files",
      icon: BarChart3,
    },
  ]

  const summaryRows = [
    { label: "Success rate", value: stats.successRate ? `${Math.round(stats.successRate)}%` : "-" },
    { label: "Selected period", value: stats.selectedPeriodProcessed.toLocaleString() },
    { label: "Active jobs", value: stats.activeJobs.toLocaleString() },
  ]

  const tools = [
    {
      title: "Table extraction",
      detail: "Rows and columns",
      href: "/dashboard/client",
      iconSrc: "/solution/accounting.svg",
    },
    {
      title: "Bank statements",
      detail: "Text and transactions",
      href: "/dashboard/bank-statements",
      iconSrc: "/solution/banking.svg",
    },
    {
      title: "Invoices",
      detail: "Totals and line items",
      href: "/dashboard/invoice-receipts",
      iconSrc: "/solution/Backoffice%20Automation.svg",
    },
    {
      title: "Text output",
      detail: "Readable extraction",
      href: "/dashboard/client?mode=text",
      iconSrc: "/excel.svg",
    },
  ]

  const sortedFiles = [...recentFiles].sort((left, right) => {
    const leftTime = new Date(left.updated_at || left.saved_at || left.created_at).getTime()
    const rightTime = new Date(right.updated_at || right.saved_at || right.created_at).getTime()
    return fileSort === "modified-desc" ? rightTime - leftTime : leftTime - rightTime
  })

  return (
    <DashboardShell activeItem="overview" title="Dashboard" user={user} showBack={false}>
      <div className="space-y-10 pt-2">
        <section>
          <h2 className="mb-4 text-xl font-bold tracking-tight text-foreground">Tools</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tools.map((tool) => {
              return (
                <Link
                  key={tool.title}
                  href={tool.href}
                  className="group flex h-[86px] items-center gap-4 rounded-xl border border-border bg-card px-4 shadow-xs transition-colors hover:bg-accent/60"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/35 p-1.5">
                    <Image src={tool.iconSrc} alt="" width={34} height={34} className="size-full object-contain" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[15px] font-semibold text-foreground">{tool.title}</span>
                    <span className="mt-0.5 block truncate text-[13px] font-medium text-muted-foreground">{tool.detail}</span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="min-h-[420px]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="flex items-baseline gap-2 text-xl font-bold tracking-tight text-foreground">
              My files
              <span className="text-base font-medium text-muted-foreground">{sortedFiles.length}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-10 rounded-lg px-3 text-sm font-medium"
                onClick={() => setFileSort((current) => current === "modified-desc" ? "modified-asc" : "modified-desc")}
              >
                Last modified
                <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", fileSort === "modified-asc" && "rotate-180")} />
              </Button>
              <Button variant="outline" className="h-10 rounded-lg px-3 text-sm font-medium" asChild>
                <Link href="/history">
                  All files
                  <ChevronDown className="size-4 text-muted-foreground" />
                </Link>
              </Button>
              <div className="flex overflow-hidden rounded-lg border border-border bg-card p-0.5 shadow-xs">
                <button
                  type="button"
                  aria-label="Grid view"
                  onClick={() => setFileView("grid")}
                  className={cn("flex size-9 items-center justify-center rounded-md transition-colors", fileView === "grid" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  <Grid2X2 className="size-4" />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  onClick={() => setFileView("list")}
                  className={cn("flex size-9 items-center justify-center rounded-md transition-colors", fileView === "list" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}
                >
                  <List className="size-4" />
                </button>
              </div>
              <Button variant="ghost" size="icon" className="size-10 rounded-lg" asChild>
                <Link href="/history" aria-label="Open history">
                  <MoreHorizontal className="size-5 text-muted-foreground" />
                </Link>
              </Button>
            </div>
          </div>

          {filesLoading ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm font-medium text-muted-foreground">
              Loading files
            </div>
          ) : sortedFiles.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-5 text-center">
              <Grid2X2 className="size-5 text-muted-foreground/60" />
              <p className="text-[15px] font-medium text-foreground">No files yet. Upload your first batch.</p>
              <Button asChild variant="outline" className="h-10 rounded-lg px-5 font-medium">
                <Link href="/dashboard/client#upload-files">
                  <Upload className="size-4 text-muted-foreground" />
                  Upload
                </Link>
              </Button>
            </div>
          ) : fileView === "grid" ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {sortedFiles.map((file) => (
                <Link
                  key={file.id}
                  href="/history"
                  className="flex min-h-[90px] items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-xs transition-colors hover:bg-accent/55"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FileSpreadsheet className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-foreground">{file.filename || "Converted file"}</span>
                    <span className="mt-1 block text-xs font-medium text-muted-foreground">
                      {format(new Date(file.updated_at || file.saved_at || file.created_at), "MMM d, yyyy")}
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
                  className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0 hover:bg-accent/55"
                >
                  <FileSpreadsheet className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{file.filename || "Converted file"}</span>
                  <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                    {format(new Date(file.updated_at || file.saved_at || file.created_at), "MMM d, yyyy")}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 border-t border-border pt-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-lg font-bold tracking-tight text-foreground">Usage</p>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchDashboardData}
              disabled={loading}
              className="h-9"
            >
              <RefreshCw className={cn("me-2 size-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((item) => {
              const Icon = item.icon

              return (
                <Card key={item.title}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {item.title}
                    </CardTitle>
                    <Icon className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                    </div>
                    <p className="text-xs text-muted-foreground">{item.helper}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

          <DashboardMiniCharts chartData={chartData} stats={stats} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Processing Activity
                </CardTitle>
                <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                  <TabsList>
                    {(["1d", "7d", "30d", "3m"] as TimeRange[]).map((range) => (
                      <TabsTrigger key={range} value={range}>
                        {range === "1d" ? "24h" :
                          range === "7d" ? "7D" :
                            range === "30d" ? "30D" : "3M"}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="ps-2">
                <DashboardChart chartData={chartData} timeRange={timeRange} />
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Period summary</CardTitle>
                <CardDescription>Activity for the selected reporting window.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {summaryRows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-4">
                      <p className="truncate text-sm font-medium">{row.label}</p>
                      <p className="text-sm font-semibold tabular-nums text-primary">{row.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
      </div>
    </DashboardShell>
  )
}

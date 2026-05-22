"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useBillingStatus } from "@/hooks/useBillingStatus"
import { ocrApi, type RecoverableJobSummary } from "@/lib/api-client"
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
  FileSpreadsheet,
  RefreshCw,
  Timer,
  TrendingUp
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

function formatPlanLabel(plan?: string | null) {
  if (!plan || plan === "free") return "Free"
  if (plan === "pro") return "Standard"
  if (plan === "max" || plan === "business") return "Pro"
  if (plan === "mega" || plan === "enterprise") return "Max"
  return plan.charAt(0).toUpperCase() + plan.slice(1)
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { billingStatus, credits, isLoading: billingLoading } = useBillingStatus({
    enabled: Boolean(user),
    loadStatus: true,
    loadLimits: true,
  })
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [chartData, setChartData] = useState<ProcessingData[]>([])
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [savedJobs, setSavedJobs] = useState<Job[]>([])
  const [recoverableJob, setRecoverableJob] = useState<RecoverableJobSummary | null>(null)
  const [workflowLoading, setWorkflowLoading] = useState(true)
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
      fetchWorkflowData()
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

  const fetchWorkflowData = async () => {
    setWorkflowLoading(true)

    const [historyResponse, savedResponse, recoveryResponse] = await Promise.all([
      ocrApi.getHistory(12, 0).catch(() => null),
      ocrApi.getSavedHistory(6, 0).catch(() => null),
      ocrApi.getLatestRecoverableJob().catch(() => null),
    ])

    setRecentJobs(sortJobsByDate(normalizeHistoryJobs(historyResponse)).slice(0, 8))
    setSavedJobs(sortJobsByDate(normalizeHistoryJobs(savedResponse)).slice(0, 5))
    setRecoverableJob(recoveryResponse?.job?.active ? recoveryResponse.job : null)
    setWorkflowLoading(false)
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

  const sortJobsByDate = (jobs: Job[]) => {
    return [...jobs].sort((a, b) => {
      const aDate = new Date(getJobDate(a)).getTime() || 0
      const bDate = new Date(getJobDate(b)).getTime() || 0
      return bDate - aDate
    })
  }

  const getJobDate = (job: Job) => {
    return job.saved_at || job.updated_at || job.created_at
  }

  const formatJobDate = (job: Job) => {
    const parsed = new Date(getJobDate(job))
    if (Number.isNaN(parsed.getTime())) return "Recent"
    return format(parsed, "MMM d, h:mm a")
  }

  const getJobName = (job: Job) => {
    return job.filename || `Batch ${String(job.original_job_id || job.id || "").slice(0, 8) || "run"}`
  }

  const jobNeedsAttention = (job: Job) => {
    let metadata = job.processing_metadata
    if (typeof metadata === "string") {
      try {
        metadata = JSON.parse(metadata)
      } catch {
        metadata = undefined
      }
    }

    return (
      ["failed", "partially_completed"].includes(job.status) ||
      Boolean(
        job.requires_review ||
        metadata?.requires_review ||
        metadata?.failed_images ||
        metadata?.failed_files
      )
    )
  }

  const getStatusLabel = (job: Job) => {
    if (jobNeedsAttention(job)) return job.status === "failed" ? "Failed" : "Review"
    if (job.status === "completed") return "Ready"
    if (job.status === "processing") return "Processing"
    if (job.status === "queued") return "Queued"
    return job.status || "Recent"
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
    { label: "Needs review", value: stats.failedJobs.toLocaleString() },
  ]

  const attentionJobs = recentJobs.filter(jobNeedsAttention).slice(0, 4)
  const outputJobs = (savedJobs.length
    ? savedJobs
    : recentJobs.filter((job) => job.status === "completed" || job.status === "partially_completed")
  ).slice(0, 4)
  const availableCredits = credits?.available_credits ?? billingStatus?.credits?.available_credits ?? null
  const planLabel = billingLoading && !billingStatus ? "Loading" : formatPlanLabel(billingStatus?.plan)
  const recoveryProgress = recoverableJob?.total_images
    ? `${recoverableJob.processed_images || 0}/${recoverableJob.total_images} files`
    : recoverableJob?.percentage
      ? `${Math.round(recoverableJob.percentage)}%`
      : null

  return (
    <DashboardShell activeItem="overview" title="Dashboard" user={user} showBack={false}>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batch workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start the next handwritten file run, recover active work, and review recent outputs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              fetchDashboardData()
              fetchWorkflowData()
            }}
            disabled={loading || workflowLoading}
            className="h-9"
          >
            <RefreshCw className={cn("me-2 size-4", (loading || workflowLoading) && "animate-spin")} />
            Refresh
          </Button>
          <Button className="h-9" onClick={() => router.push("/dashboard/client")}>Convert Files</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.38fr)_minmax(340px,0.82fr)]">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border pb-5">
              <CardTitle className="text-xl">Next batch</CardTitle>
              <CardDescription className="max-w-2xl leading-6">
                Convert handwritten invoices, bank statements, table photos, and PDF pages into files you can review before download.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 p-6">
              <div className="rounded-md border border-border bg-muted/35 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Normal result view</p>
                  <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground">
                    Batch review board
                  </span>
                </div>
                <div className="grid gap-3">
                  {[
                    ["handwritten_invoice_04.jpg", "invoice_04.xlsx", "Ready"],
                    ["bank_statement_page_02.pdf", "statement_page_02.xlsx", "Needs review"],
                    ["field_table_11.png", "field_table_11.xlsx", "Edited"],
                  ].map(([input, output, state], index) => (
                    <div key={input} className="grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-center">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Input</p>
                        <p className="mt-1 truncate text-sm font-semibold text-foreground">{input}</p>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Output</p>
                        <p className="mt-1 truncate text-sm font-semibold text-foreground">{output}</p>
                      </div>
                      <span
                        className={cn(
                          "w-fit rounded-md border px-2.5 py-1 text-xs font-semibold",
                          index === 1
                            ? "border-amber-200 bg-amber-50 text-amber-800"
                            : index === 2
                              ? "border-primary/20 bg-primary/10 text-primary"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800"
                        )}
                      >
                        {state}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button onClick={() => router.push("/dashboard/client")}>Convert Files</Button>
                <Button variant="outline" onClick={() => router.push("/dashboard/bank-statements")}>Bank statement mode</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Workspace status</CardTitle>
              <CardDescription>Your plan, credits, and live batch state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="rounded-md border border-border bg-muted/25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Plan</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{planLabel}</p>
                </div>
                <div className="rounded-md border border-border bg-muted/25 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Credits</p>
                  <p className="mt-2 text-xl font-semibold tabular-nums text-foreground">
                    {typeof availableCredits === "number" ? availableCredits.toLocaleString() : "-"}
                  </p>
                </div>
              </div>

              <div className="rounded-md border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {recoverableJob ? "Recoverable batch" : stats.activeJobs ? "Active batch" : "No active batch"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {recoverableJob
                        ? `${recoverableJob.status}${recoveryProgress ? ` - ${recoveryProgress}` : ""}`
                        : stats.activeJobs
                          ? `${stats.activeJobs} job${stats.activeJobs === 1 ? "" : "s"} currently active`
                          : "The workspace is ready for a new run."}
                    </p>
                  </div>
                  {recoverableJob ? (
                    <Button size="sm" onClick={() => router.push("/dashboard/client")}>Continue</Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>Needs review</CardTitle>
                  <CardDescription>Runs that need a quick check before handoff.</CardDescription>
                </div>
                <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-sm font-semibold tabular-nums text-foreground">
                  {Math.max(attentionJobs.length, stats.failedJobs)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {attentionJobs.length ? (
                <div className="space-y-3">
                  {attentionJobs.map((job) => (
                    <div key={job.id || job.original_job_id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{getJobName(job)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatJobDate(job)} - {getJobImageCount(job)} files</p>
                      </div>
                      <span className="rounded-md border border-border bg-muted px-2 py-1 text-xs font-semibold text-foreground">
                        {getStatusLabel(job)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border p-5">
                  <p className="text-sm font-medium text-foreground">No recent review blockers</p>
                  <p className="mt-1 text-sm text-muted-foreground">New exceptions and partial runs will surface here.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
              <div>
                <CardTitle>Recent outputs</CardTitle>
                <CardDescription>Corrected or completed batches ready to download.</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => router.push("/history")}>History</Button>
            </CardHeader>
            <CardContent>
              {outputJobs.length ? (
                <div className="space-y-3">
                  {outputJobs.map((job) => (
                    <div key={job.id || job.original_job_id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{getJobName(job)}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatJobDate(job)} - {getJobImageCount(job)} files</p>
                      </div>
                      <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                        {getStatusLabel(job)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-md border border-dashed border-border p-5">
                  <p className="text-sm font-medium text-foreground">No saved outputs yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">Completed spreadsheet files will collect in History after a run.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="pt-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-muted-foreground">Volume and processing</p>
            <p className="hidden text-xs text-muted-foreground sm:block">Analytics stay below current batch work.</p>
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
        </div>

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

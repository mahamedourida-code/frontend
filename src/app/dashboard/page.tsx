"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGroup, motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { ocrApi } from "@/lib/api-client"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardShell } from "@/components/DashboardShell"
import { DashboardMiniCharts } from "@/components/dashboard/DashboardMiniCharts"
import { DashboardRouteLoader } from "@/components/dashboard/DashboardRouteLoader"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { SkeletonStatCard } from "@/components/dashboard/SkeletonCard"
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

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: "1d", label: "24h" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "3m", label: "3M" },
]

function rangeStartDate(value: TimeRange, now: Date): Date {
  switch (value) {
    case "1d":
      return subHours(now, 24)
    case "7d":
      return subDays(now, 7)
    case "30d":
      return subDays(now, 30)
    case "3m":
      return subDays(now, 90)
  }
}

function TimeRangePill({
  value,
  onChange,
  disabled,
}: {
  value: TimeRange
  onChange: (next: TimeRange) => void
  disabled?: boolean
}) {
  return (
    <LayoutGroup id="dashboard-time-range">
      <div
        role="tablist"
        aria-label="Time range"
        className={cn(
          "relative inline-flex items-center rounded-full border border-border bg-muted/50 p-[1px]",
          disabled && "pointer-events-none opacity-60",
        )}
      >
        {TIME_RANGE_OPTIONS.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option.value)}
              className={cn(
                "relative z-10 inline-flex h-8 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors",
                active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {active && (
                <motion.span
                  layoutId="time-range-pill"
                  className="absolute inset-[1px] -z-10 rounded-full bg-background shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              {option.label}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}

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
      router.replace('/sign-in?next=%2Fdashboard')
    } else if (!authLoading && user) {
      fetchDashboardData()
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

  if (authLoading) {
    return <DashboardRouteLoader label="Loading dashboard" />
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

  const dateRangeLabel = (() => {
    const now = new Date()
    const start = rangeStartDate(timeRange, now)
    if (timeRange === "1d") {
      return `${format(start, "MMM d, h:mm a")} – ${format(now, "h:mm a")}`
    }
    return `${format(start, "MMM d, yyyy")} – ${format(now, "MMM d, yyyy")}`
  })()

  return (
    <DashboardShell activeItem="overview" title="Dashboard" user={user} showBack={false}>
      <div className="space-y-4">
        <PageHeader
          title="Dashboard"
          description="Volume and processing activity"
          actions={
            <div className="flex items-center gap-2">
              <TimeRangePill value={timeRange} onChange={setTimeRange} disabled={loading} />
              <Button
                variant="surface"
                size="sm"
                onClick={fetchDashboardData}
                disabled={loading}
                className="h-9"
                aria-label="Refresh dashboard"
              >
                <RefreshCw className={cn("size-4", loading && "animate-spin")} />
              </Button>
            </div>
          }
        />
        <p className="text-xs text-muted-foreground" aria-live="polite">
          Showing {dateRangeLabel}
        </p>
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonStatCard key={`stat-skeleton-${index}`} />
                ))
              : metricCards.map((item) => {
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
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Processing Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="ps-2">
                {loading ? (
                  <div className="flex h-[280px] items-end gap-1.5 px-3">
                    {Array.from({ length: 16 }).map((_, index) => (
                      <div
                        key={`chart-skeleton-${index}`}
                        className="flex-1 animate-pulse rounded-sm bg-accent"
                        style={{ height: `${30 + ((index * 19) % 60)}%` }}
                      />
                    ))}
                  </div>
                ) : (
                  <DashboardChart chartData={chartData} timeRange={timeRange} />
                )}
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

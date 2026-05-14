"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { ocrApi } from "@/lib/api-client"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardShell } from "@/components/DashboardShell"
import { useBillingStatus } from "@/hooks/useBillingStatus"
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
    successRate: 0
  })
  const [loading, setLoading] = useState(true)
  const { refresh: refreshBilling } = useBillingStatus({
    enabled: Boolean(user && !authLoading),
    loadStatus: true,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
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

      const [historyResponse, billingSnapshot] = await Promise.all([
        ocrApi.getHistory(500, 0),
        refreshBilling({
          includeStatus: true,
          includePlans: false,
          includeLimits: false,
        }),
      ])
      const creditsResponse = billingSnapshot?.status?.credits || null
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

      const userTotalProcessed = creditsResponse?.used_credits ?? 0
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
        totalProcessed: userTotalProcessed || totalImages,
        todayProcessed: todayImages,
        thisMonthProcessed: thisMonthProcessed,
        monthProcessed: thisMonthProcessed,
        lastWeekProcessed: lastWeekProcessed,
        averageTime: avgTime,
        successRate
      }
      setStats(newStats)
    } catch (error) {
      // Set default values on error
      setChartData([])
      setStats({
        totalProcessed: 0,
        todayProcessed: 0,
        thisMonthProcessed: 0,
        monthProcessed: 0,
        lastWeekProcessed: 0,
        averageTime: 0,
        successRate: 0
      })
    } finally {
      setLoading(false)
    }
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
      <div className="flex min-h-screen items-center justify-center bg-[#f7faf7]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#166534] border-t-transparent" />
          <p className="text-sm font-medium text-[#667085]">Loading dashboard</p>
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
      helper: "Images processed",
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
      helper: "All time images",
      icon: BarChart3,
    },
  ]

  const summaryRows = [
    { label: "Success rate", value: stats.successRate ? `${Math.round(stats.successRate)}%` : "-" },
    { label: "Last 7 days", value: stats.lastWeekProcessed.toLocaleString() },
    { label: "Selected period", value: chartData.reduce((sum, item) => sum + item.count, 0).toLocaleString() },
  ]

  return (
    <DashboardShell activeItem="overview" title="Dashboard" user={user} showBack={false}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Tabs value="overview" className="w-fit">
            <TabsList className="h-9 rounded-lg bg-[#eef5ee] p-1 text-[#667085]">
              <TabsTrigger value="overview" className="rounded-md px-3 text-sm data-[state=active]:bg-white data-[state=active]:text-[#166534]">
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" disabled className="rounded-md px-3 text-sm">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reports" disabled className="rounded-md px-3 text-sm">
                Reports
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchDashboardData}
            disabled={loading}
            className="h-9 w-fit rounded-lg border-[#dfe8df] bg-white px-3 text-[#166534] shadow-sm hover:bg-[#f7faf7]"
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metricCards.map((item) => {
            const Icon = item.icon

            return (
              <Card key={item.title} className="rounded-xl border-[#dfe8df] bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#344054]">
                    {item.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-[#667085]" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tracking-tight text-[#111827]">
                    {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#667085]">{item.helper}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <Card className="col-span-1 rounded-xl border-[#dfe8df] bg-white shadow-sm lg:col-span-4">
            <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#111827]">
                  <TrendingUp className="h-4 w-4 text-[#166534]" />
                  Processing Activity
                </CardTitle>
              </div>
              <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <TabsList className="h-9 rounded-lg bg-[#eef5ee] p-1">
                  {(["1d", "7d", "30d", "3m"] as TimeRange[]).map((range) => (
                    <TabsTrigger
                      key={range}
                      value={range}
                      className="rounded-md px-3 text-xs data-[state=active]:bg-white data-[state=active]:text-[#166534]"
                    >
                      {range === "1d" ? "24h" :
                        range === "7d" ? "7D" :
                          range === "30d" ? "30D" : "3M"}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <DashboardChart
                chartData={chartData}
                timeRange={timeRange}
              />
            </CardContent>
          </Card>

          <Card className="col-span-1 rounded-xl border-[#dfe8df] bg-white shadow-sm lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-[#111827]">Run Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-4">
                {summaryRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#344054]">{row.label}</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-[#166534]">{row.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[#dfe8df] bg-[#f7faf7] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#166534]" />
                  <div>
                    <p className="text-sm font-medium text-[#111827]">Batch workspace</p>
                    <p className="mt-1 text-sm text-[#667085]">Ready for image and PDF runs.</p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/dashboard/client")}
                  className="mt-4 h-10 rounded-lg bg-[#166534] px-4 text-white shadow-sm hover:bg-[#14532d]"
                >
                  Process Images
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  )
}

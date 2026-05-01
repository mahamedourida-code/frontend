"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { ocrApi } from "@/lib/api-client"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileNav } from "@/components/MobileNav"
import { WorkspaceSidebar } from "@/components/WorkspaceSidebar"
import { BillingSeal } from "@/components/BillingGlyphs"
import { cn } from "@/lib/utils"
import {
  Activity,
  Upload,
  ArrowRight,
  Image,
  Clock,
  BarChart3,
  TrendingUp,
  ChevronLeft
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

      const [historyResponse, creditsResponse] = await Promise.all([
        ocrApi.getHistory(500, 0),
        ocrApi.getUserCredits().catch(() => null),
      ])
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  // Remove credits logic - just track processed images

  return (
    <div className="ax-page-bg min-h-screen lg:flex lg:gap-4 lg:p-4">
      <WorkspaceSidebar activeItem="overview" user={user} />

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:px-8 lg:py-4">
          <div className="mb-6 rounded-[30px] border border-[#ebe2ff] bg-[#FCF2FF]/90 p-4 shadow-[0_24px_80px_rgba(68,31,132,0.08)] backdrop-blur-xl sm:p-5 lg:mb-8 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mt-1 h-11 rounded-2xl border border-[#eadfff] bg-white/55 px-4 text-[#5b3f92] hover:bg-white hover:text-[#2f165e]"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <div>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Dashboard</h1>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-12 rounded-[22px] border-[#d9c9fb] bg-white/55 px-5 text-[#2f165e] shadow-[0_14px_35px_rgba(68,31,132,0.10)] hover:bg-white w-full sm:w-auto"
                >
                  <Link href="/pricing">
                    <BillingSeal className="h-5 w-5" />
                    <span className="ml-2">Plans</span>
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-[22px] bg-[#2f165e] px-5 text-white shadow-[0_18px_40px_rgba(68,31,132,0.22)] transition-all hover:bg-[#3a1d72] hover:shadow-[0_22px_44px_rgba(68,31,132,0.26)] w-full sm:w-auto"
                >
                  <Link href="/dashboard/client">
                    <Upload className="h-5 w-5" />
                    <span className="ml-2">Process Images</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>



          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 lg:mb-8">
            <Card className="ax-glass-card">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Today's Images</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-1">{stats.todayProcessed}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Image className="h-8 w-8 lg:h-10 lg:w-10 text-primary/60" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ax-glass-card">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Average Time</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-1">
                      {stats.monthProcessed > 0 ? '~5s' : '-'}
                    </p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">Per image</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 lg:h-10 lg:w-10 text-primary/60" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ax-glass-card relative">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs lg:text-sm text-muted-foreground">Total Processed</p>
                    <p className="text-2xl lg:text-3xl font-bold mt-1">{stats.totalProcessed}</p>
                    <p className="text-[10px] lg:text-xs text-muted-foreground mt-0.5">All time images</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={fetchDashboardData}
                      disabled={loading}
                      className="h-8 w-8 p-0"
                      title="Refresh stats"
                    >
                      <Activity className={cn("h-4 w-4", loading && "animate-spin")} />
                    </Button>
                    <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-primary/60" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card className="bg-transparent border-2 border-[#A78BFA] shadow-lg shadow-[#A78BFA]/10">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 lg:p-4">
              <div>
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5" />
                  Processing Activity
                </CardTitle>
                <CardDescription className="text-xs lg:text-sm mt-1">Number of images processed over time</CardDescription>
              </div>
              <div className="flex items-center gap-1 lg:gap-2 w-full sm:w-auto">
                {(["1d", "7d", "30d", "3m"] as TimeRange[]).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="flex-1 sm:flex-none min-w-0 h-8 px-2 lg:px-3 text-xs"
                  >
                    {range === "1d" ? "24h" :
                     range === "7d" ? "7D" :
                     range === "30d" ? "30D" : "3M"}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-3 lg:p-4">
              <DashboardChart 
                chartData={chartData} 
                timeRange={timeRange}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isAuthenticated={true} user={user} />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/utils/supabase/client"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppIcon } from "@/components/AppIcon"
import { MobileNav } from "@/components/MobileNav"
import {
  FileSpreadsheet,
  Upload,
  History,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Activity,
  AlertCircle,
  ArrowRight,
  ChartLine,
  Image,
  Clock,
  BarChart3,
  Calendar,
  TrendingUp,
  ChevronLeft
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  const { user, loading: authLoading, signOut } = useAuth()
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

  // Sidebar navigation items
  const sidebarItems = [
    { label: "Overview", description: "Usage and activity", icon: Activity, href: "/dashboard", active: true },
    { label: "Process Images", description: "Run new conversions", icon: Upload, href: "/dashboard/client", active: false },
    { label: "History", description: "Review past exports", icon: History, href: "/history", active: false },
    { label: "Settings", description: "Manage preferences", icon: Settings, href: "/dashboard/settings", active: false }
  ]

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
    const supabase = createClient()

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

      // Fetch user's jobs
      const { data: jobs, error } = await supabase
        .from('processing_jobs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', fromDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[Dashboard] Error fetching jobs:', error)
        // Don't throw, continue with empty data
        const typedJobs: Job[] = []
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
        return
      }

      const typedJobs = (jobs || []) as Job[]
      console.log('[Dashboard] Jobs fetched:', {
        count: typedJobs.length,
        sample: typedJobs[0],
        metadata: typedJobs[0]?.processing_metadata
      })

      // Process data for chart
      const processedData = generateChartData(typedJobs, timeRange)
      console.log('[Dashboard] Chart data generated:', {
        timeRange,
        dataPoints: processedData.length,
        totalJobs: typedJobs.length,
        data: processedData
      })
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

      // Fetch user stats from simplified stats table
      const { data: userStats, error: statsError } = await supabase
        .from('user_stats')
        .select('total_processed, month_processed, month_start_date, last_processed_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (statsError) {
        console.error('[Dashboard] Error fetching user stats:', statsError)
      }

      const userTotalProcessed = userStats?.total_processed || 0
      const userMonthProcessed = userStats?.month_processed || 0

      // Use month processed from user stats
      const thisMonthProcessed = userMonthProcessed
      
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
      console.log('[Dashboard] Stats calculated:', {
        totalProcessed: userTotalProcessed || totalImages,
        todayProcessed: todayImages,
        thisMonth: thisMonthProcessed,
        lastWeek: lastWeekProcessed
      })
      setStats(newStats)
    } catch (error) {
      console.error('[Dashboard] Error fetching dashboard data:', error)
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
              console.error('Error parsing metadata:', e)
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
              console.error('Error parsing metadata:', e)
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

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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
    <div className="ax-page-bg min-h-screen bg-[#fcfbff] lg:p-4">
      {/* Sidebar - Hidden on Mobile */}
      <aside className="relative z-10 hidden lg:flex lg:w-[290px] lg:flex-col">
        <div className="sticky top-4 flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[30px] border border-[#ebe2ff] bg-white/92 shadow-[0_24px_80px_rgba(68,31,132,0.10)] backdrop-blur-xl">
          {/* App Logo */}
          <div className="border-b border-[#efe7ff] px-5 pb-5 pt-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfff] bg-[#f7f1ff]">
                  <AppIcon size={30} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c62b1]">Workspace</p>
                  <span className="text-xl font-bold text-black dark:text-white">AxLiner</span>
                </div>
              </div>
              <Badge className="rounded-full border border-[#e8dcff] bg-[#fbf8ff] px-2.5 py-1 text-[11px] font-semibold text-[#5b3f92] shadow-none hover:bg-[#fbf8ff]">
                Active
              </Badge>
            </div>
            {/* User Profile */}
            <div className="mt-5 rounded-[24px] border border-[#efe7ff] bg-[#fbf9ff] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-[#eadfff] shadow-sm">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary/10">
                    {user?.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Free plan workspace</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#eadfff] bg-white px-3 py-2">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7c62b1]">Total processed</p>
                  <p className="text-lg font-bold text-foreground">{stats.totalProcessed}</p>
                </div>
                <div className="rounded-full bg-[#f5eeff] px-2.5 py-1 text-[11px] font-semibold text-[#5b3f92]">
                  all time
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-5">
            <div className="mb-3 px-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d79bb]">Navigation</p>
            </div>
            <div className="space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-sm transition-all duration-200",
                    item.active
                      ? "bg-[#2f165e] text-white shadow-[0_18px_40px_rgba(68,31,132,0.22)]"
                      : "text-muted-foreground hover:bg-[#f6f1ff] hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors",
                      item.active
                        ? "border-white/10 bg-white/10 text-white"
                        : "border-[#eadfff] bg-white text-[#65479f] group-hover:border-[#dccbff]"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn("truncate font-semibold", item.active ? "text-white" : "text-foreground")}>
                      {item.label}
                    </p>
                    <p className={cn("truncate text-xs", item.active ? "text-white/70" : "text-muted-foreground")}>
                      {item.description}
                    </p>
                  </div>
                </Link>
              ))}
              
              {/* Sign Out Button - Below Settings */}
              <button
                onClick={handleSignOut}
                className="mt-4 flex w-full items-center gap-3 rounded-[22px] border border-[#f1e9ff] px-3 py-3 text-sm text-muted-foreground transition-colors hover:bg-[#f8f4ff] hover:text-foreground"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#eadfff] bg-white text-[#65479f]">
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">Sign Out</p>
                  <p className="text-xs text-muted-foreground">Exit this workspace</p>
                </div>
              </button>
            </div>
          </nav>

          <div className="border-t border-[#efe7ff] p-4">
            <div className="rounded-[24px] border border-[#efe7ff] bg-[#fbf9ff] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <HelpCircle className="h-4 w-4 text-[#65479f]" />
                Need a faster run?
              </div>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                Jump straight into the upload workspace for new handwritten and table conversions.
              </p>
              <Button asChild className="mt-4 h-10 w-full rounded-2xl bg-[#2f165e] text-white hover:bg-[#3a1d72] shadow-[0_12px_30px_rgba(68,31,132,0.22)]">
                <Link href="/dashboard/client">Open uploader</Link>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:px-8 lg:py-4">
          <div className="mb-6 rounded-[30px] border border-[#ebe2ff] bg-white/92 p-4 shadow-[0_24px_80px_rgba(68,31,132,0.08)] backdrop-blur-xl sm:p-5 lg:mb-8 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="mt-1 h-11 rounded-2xl border border-[#eadfff] bg-[#faf7ff] px-4 text-[#5b3f92] hover:bg-[#f3ebff] hover:text-[#2f165e]"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Back
                </Button>
                <div>
                  <div className="inline-flex items-center rounded-full border border-[#eadfff] bg-[#fbf8ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7c62b1]">
                    Overview
                  </div>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground lg:text-4xl">Dashboard</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Monitor image volume, processing pace, and recent activity across your AxLiner workspace.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3 rounded-[22px] border border-[#efe7ff] bg-[#fbf9ff] px-3 py-2.5">
                  <Avatar className="h-10 w-10 border border-[#eadfff] shadow-sm">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10">
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
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

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
    { label: "Overview", icon: Activity, href: "/dashboard", active: true },
    { label: "Process Images", icon: Upload, href: "/dashboard/client", active: false }, // Changed to client
    { label: "History", icon: History, href: "/history", active: false },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", active: false }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    } else if (!authLoading && user) {
      fetchDashboardData()
    }
  }, [user?.id, authLoading])

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
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Remove credits logic - just track processed images

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Duplo29 Background */}
      <div className="fixed top-0 left-0 w-full pointer-events-none z-0">
        <img
          src="/duplo29.jpg"
          alt="Background pattern"
          className="w-full h-auto"
        />
      </div>
      {/* Sidebar - Hidden on Mobile */}
      <div className="hidden lg:block w-64 border-r bg-card/50 backdrop-blur relative z-10">
        <div className="flex flex-col h-full">
          {/* App Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-6">
              <AppIcon size={32} />
              <span className="text-xl font-bold text-black dark:text-white">AxLiner</span>
            </div>
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email}
                </p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                    item.active
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
              
              {/* Sign Out Button - Below Settings */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </nav>

          {/* Empty space at bottom */}
          <div className="p-4"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-1 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          {/* Header with Process Images Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 lg:mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">Monitor your document processing activity</p>
            </div>
            <Button
              size="lg"
              onClick={() => router.push('/dashboard/client')} // Changed to client
              className="gap-2 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
            >
              <Upload className="h-5 w-5" />
              <span className="hidden sm:inline">Process Images</span>
              <span className="sm:hidden">Upload</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>



          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 lg:mb-8">
            <Card className="border-2 border-primary shadow-lg shadow-primary/10" style={{ backgroundColor: '#fbfdfc' }}>
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

            <Card className="border-2 border-primary shadow-lg shadow-primary/10" style={{ backgroundColor: '#fbfdfc' }}>
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

            <Card className="border-2 border-primary shadow-lg shadow-primary/10 relative" style={{ backgroundColor: '#fbfdfc' }}>
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
          <Card className="bg-transparent border-2 border-primary shadow-lg shadow-primary/10">
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

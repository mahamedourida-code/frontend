"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/utils/supabase/client"
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
  ChartLine
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts"
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
  creditsUsed: number
  totalCredits: number
  availableCredits: number
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
    creditsUsed: 0,
    totalCredits: 80,
    availableCredits: 80,
    averageTime: 0,
    successRate: 0
  })
  const [loading, setLoading] = useState(true)

  // Sidebar navigation items
  const sidebarItems = [
    { label: "Overview", icon: Activity, href: "/dashboard", active: true },
    { label: "Process Images", icon: Upload, href: "/dashboard/upload-type", active: false },
    { label: "History", icon: History, href: "/dashboard/history", active: false },
    { label: "Settings", icon: Settings, href: "/dashboard/settings", active: false, disabled: true },
    { label: "Help", icon: HelpCircle, href: "/dashboard/help", active: false, disabled: true }
  ]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    } else if (user) {
      // Initial data fetch
      fetchDashboardData()

      // Set up Supabase Realtime subscriptions for instant updates
      const supabase = createClient()
      const subscription = supabase
        .channel('dashboard-updates')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'processing_jobs',
            filter: `user_id=eq.${user.id}`
          },
          async (payload) => {
            console.log('Job change detected:', payload)
            // Refresh data when jobs are created, updated, or deleted
            fetchDashboardData()

            // Refresh when job completes to update all stats including credits
            if (payload.new && (payload.new as any).status === 'completed') {
              console.log('Job completed, refreshing dashboard...')
            }
          }
        )
        .subscribe((status) => {
          console.log('Realtime subscription status:', status)
        })

      // Polling to refresh dashboard data (including credits)
      const refreshInterval = setInterval(() => {
        if (!document.hidden) {
          fetchDashboardData()
        }
      }, 10000) // Refresh every 10 seconds when tab is active

      // Cleanup on unmount
      return () => {
        subscription.unsubscribe()
        clearInterval(refreshInterval)
      }
    }
  }, [user, authLoading, router, timeRange])

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

      if (error) throw error

      const typedJobs = (jobs || []) as Job[]

      // Process data for chart
      const processedData = generateChartData(typedJobs, timeRange)
      setChartData(processedData)

      // Calculate stats
      const totalJobs = typedJobs.length
      const totalImages = typedJobs.reduce((sum, job) => 
        sum + (job.processing_metadata?.total_images || 1), 0)
      
      // Get today's jobs
      const todayStart = startOfDay(now)
      const todayJobs = typedJobs.filter(job => 
        new Date(job.created_at) >= todayStart
      )
      const todayImages = todayJobs.reduce((sum, job) => 
        sum + (job.processing_metadata?.total_images || 1), 0)
      
      // Calculate average processing time
      const processingTimes = typedJobs.map(job => {
        if (job.processing_metadata?.processing_time) {
          return job.processing_metadata.processing_time
        }
        return 0
      }).filter(time => time > 0)
      
      const avgTime = processingTimes.length > 0
        ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
        : 0

      // Calculate success rate
      const successfulJobs = typedJobs.filter(job => job.status === 'completed').length
      const successRate = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0

      // Calculate total images processed (all time) - this is our "credits used"
      const { data: allJobs } = await supabase
        .from('processing_jobs')
        .select('processing_metadata')
        .eq('user_id', user.id)
      
      const typedAllJobs = (allJobs || []) as Job[]
      const totalImagesProcessed = typedAllJobs.reduce((sum, job) => 
        sum + (job.processing_metadata?.total_images || 1), 0)

      // Simple credit calculation - 80 total, minus what's been used
      const TOTAL_CREDITS = 80
      const creditsUsed = Math.min(totalImagesProcessed, TOTAL_CREDITS) // Cap at 80
      const creditsAvailable = Math.max(0, TOTAL_CREDITS - totalImagesProcessed) // Don't go negative

      const newStats = {
        totalProcessed: totalImages,
        todayProcessed: todayImages,
        creditsUsed: creditsUsed,
        totalCredits: TOTAL_CREDITS,
        availableCredits: creditsAvailable,
        averageTime: avgTime,
        successRate
      }
      console.log('[Dashboard] Stats calculated:', {
        totalImagesProcessed,
        creditsUsed,
        creditsAvailable
      })
      setStats(newStats)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
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
        
        const count = hourJobs.reduce((sum, job) => 
          sum + (job.processing_metadata?.total_images || 1), 0)
        
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
        
        const count = dayJobs.reduce((sum, job) => 
          sum + (job.processing_metadata?.total_images || 1), 0)
        
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
    router.push('/sign-in')
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

  const creditsPercentage = ((stats.totalCredits - stats.creditsUsed) / stats.totalCredits) * 100
  const isOutOfCredits = stats.creditsUsed >= stats.totalCredits

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Hidden on Mobile */}
      <div className="hidden lg:block w-64 border-r bg-card/50 backdrop-blur">
        <div className="flex flex-col h-full">
          {/* App Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-6">
              <AppIcon size={32} />
              <span className="text-xl font-bold text-black dark:text-white">Exceletto</span>
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
                  onClick={() => !item.disabled && router.push(item.href)}
                  disabled={item.disabled}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors",
                    item.active
                      ? "bg-primary/10 text-primary font-medium"
                      : item.disabled
                      ? "text-muted-foreground/50 cursor-not-allowed"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header with Process Images Button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Monitor your document processing activity</p>
            </div>
            <Button 
              size="lg"
              onClick={() => router.push('/dashboard/upload-type')}
              className="gap-2 shadow-lg hover:shadow-xl transition-all"
              disabled={isOutOfCredits}
            >
              <Upload className="h-5 w-5" />
              Process Images
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Out of Credits Alert */}
          {isOutOfCredits && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950/20 mb-6">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-600 text-lg">Out of Credits</h3>
                  <p className="text-sm text-red-600/80 mt-1">
                    You've used all {stats.totalCredits} of your monthly image processing credits. Contact support to continue processing.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Today's Images</p>
                <p className="text-3xl font-bold mt-2">{stats.todayProcessed}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="text-3xl font-bold mt-2">{stats.averageTime.toFixed(1)}s</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Credits Left</p>
                <p className="text-3xl font-bold mt-2">{stats.availableCredits}</p>
                <p className="text-xs text-muted-foreground mt-1">1 credit = 1 image</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Processing Activity</CardTitle>
                <CardDescription>Number of images processed over time</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {(["1d", "7d", "30d", "3m"] as TimeRange[]).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="min-w-[3rem]"
                  >
                    {range === "1d" ? "24h" :
                     range === "7d" ? "7 Days" :
                     range === "30d" ? "30 Days" : "3 Months"}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 && chartData.some(d => d.count > 0) ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                    <XAxis
                      dataKey={timeRange === "1d" ? "formattedTime" : "formattedDate"}
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 'dataMax + 2']}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px'
                      }}
                      labelStyle={{ color: '#666' }}
                      formatter={(value: any) => [`${value} images`, 'Processed']}
                    />
                    <Line
                      type="linear"
                      dataKey="count"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ fill: '#8b5cf6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[350px] text-center">
                  <ChartLine className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No Activity</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    No images processed in this time period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppIcon } from "@/components/AppIcon"
import {
  FileSpreadsheet,
  Upload,
  History,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Activity,
  Files,
  Clock,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Sparkles,
  Image,
  Download,
  Table,
  Calendar,
  TrendingUp,
  FileText,
  BarChart3,
  CreditCard as CreditIcon,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer } from "recharts"

interface DashboardStats {
  totalProcessed: number
  processedToday: number
  processedThisMonth: number
  processedThisWeek: number
  tablesExtractedToday: number
  tablesExtractedMonth: number
  creditsUsed: number
  totalCredits: number
  successRate: number
  averageProcessingTime: number
  weeklyData: Array<{
    day: string
    tables: number
    images: number
  }>
  recentJobs: Array<{
    id: string
    filename: string
    status: string
    images: number
    tables: number
    created_at: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProcessed: 0,
    processedToday: 0,
    processedThisMonth: 0,
    processedThisWeek: 0,
    tablesExtractedToday: 0,
    tablesExtractedMonth: 0,
    creditsUsed: 0,
    totalCredits: 80, // 80 images per account
    successRate: 0,
    averageProcessingTime: 0,
    weeklyData: [],
    recentJobs: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user) return

      try {
        const supabase = createClient()
        
        // Fetch ALL user's processing jobs
        const { data: allJobs } = await supabase
          .from('processing_jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        const jobs = allJobs as any[] || []
        const recentJobs = jobs.slice(0, 5)

        // Fetch user profile for credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('usage_credits, plan_type')
          .eq('id', user.id)
          .single()

        // Calculate date ranges
        const now = new Date()
        const today = new Date(now)
        today.setHours(0, 0, 0, 0)
        
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const thisWeek = new Date(now)
        thisWeek.setDate(now.getDate() - 7)

        // Filter jobs by time periods
        const todayJobs = jobs.filter((job: any) => 
          new Date(job.created_at) >= today
        )
        const monthJobs = jobs.filter((job: any) => 
          new Date(job.created_at) >= thisMonth
        )
        const weekJobs = jobs.filter((job: any) => 
          new Date(job.created_at) >= thisWeek
        )

        // Calculate tables extracted (assuming each image produces 1 table)
        const tablesExtractedToday = todayJobs.reduce((sum: number, job: any) => 
          sum + (job.processing_metadata?.total_images || 1), 0)
        const tablesExtractedMonth = monthJobs.reduce((sum: number, job: any) => 
          sum + (job.processing_metadata?.total_images || 1), 0)

        // Calculate success rate
        const completedJobs = jobs.filter((job: any) => job.status === 'completed')
        const successRate = jobs.length > 0 
          ? Math.round((completedJobs.length / jobs.length) * 100) 
          : 0

        // Calculate average processing time (mock data for now)
        const averageProcessingTime = 2.3

        // Generate weekly data for chart
        const weeklyData = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayStart = new Date(date)
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(date)
          dayEnd.setHours(23, 59, 59, 999)
          
          const dayJobs = jobs.filter((job: any) => {
            const jobDate = new Date(job.created_at)
            return jobDate >= dayStart && jobDate <= dayEnd
          })
          
          weeklyData.push({
            day: date.toLocaleDateString('en', { weekday: 'short' }),
            tables: dayJobs.reduce((sum: number, job: any) => 
              sum + (job.processing_metadata?.total_images || 1), 0),
            images: dayJobs.length
          })
        }

        // Calculate credits (80 total, 1 per image)
        const creditsUsed = monthJobs.reduce((sum: number, job: any) => 
          sum + (job.processing_metadata?.total_images || 1), 0)

        setStats({
          totalProcessed: jobs.length,
          processedToday: todayJobs.length,
          processedThisMonth: monthJobs.length,
          processedThisWeek: weekJobs.length,
          tablesExtractedToday,
          tablesExtractedMonth,
          creditsUsed: Math.min(creditsUsed, 80),
          totalCredits: 80,
          successRate,
          averageProcessingTime,
          weeklyData,
          recentJobs: recentJobs.map((job: any) => ({
            id: job.id,
            filename: job.filename || 'Unnamed',
            status: job.status || 'pending',
            images: job.processing_metadata?.total_images || 1,
            tables: job.processing_metadata?.total_images || 1,
            created_at: job.created_at
          }))
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')  // Redirect to landing page instead of sign-in
  }

  const sidebarItems = [
    { icon: Activity, label: "Overview", href: "/dashboard", active: true },
    { icon: Upload, label: "Process Images", href: "/dashboard/client" },
    { icon: History, label: "Saved Files", href: "/history" },
    { icon: Settings, label: "Settings", href: "#", disabled: true },
    { icon: CreditCard, label: "Billing", href: "#", disabled: true },
    { icon: HelpCircle, label: "Help", href: "#", disabled: true },
  ]

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const creditsPercentage = ((stats.totalCredits - stats.creditsUsed) / stats.totalCredits) * 100

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card/50 backdrop-blur">
        <div className="flex flex-col h-full">
          {/* App Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 mb-6">
              <AppIcon size={32} />
              <span className="text-xl font-bold">Exceletto</span>
            </div>
            {/* User Profile */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
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
        <div className="container max-w-6xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your OCR processing activity
            </p>
            
            {/* Credits Warning */}
            {stats.totalCredits - stats.creditsUsed <= 10 && stats.totalCredits - stats.creditsUsed > 0 && (
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Low on credits</p>
                  <p className="text-xs text-muted-foreground">
                    You have {stats.totalCredits - stats.creditsUsed} credits remaining. Contact support to increase your limit.
                  </p>
                </div>
              </div>
            )}
            {stats.creditsUsed >= stats.totalCredits && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">Out of credits</p>
                  <p className="text-xs text-muted-foreground">
                    You've used all your monthly credits. Contact support to continue processing.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Tables Extracted Today */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tables Today
                </CardTitle>
                <Table className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats.tablesExtractedToday}</div>
                <p className="text-xs text-muted-foreground">
                  Extracted today
                </p>
              </CardContent>
            </Card>

            {/* Tables This Month */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Total
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tablesExtractedMonth}</div>
                <p className="text-xs text-muted-foreground">
                  Tables this month
                </p>
              </CardContent>
            </Card>

            {/* Credits Available */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Credits Available
                </CardTitle>
                <CreditIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">
                    {stats.totalCredits - stats.creditsUsed}
                  </span>
                  <span className="text-sm text-muted-foreground">/ {stats.totalCredits}</span>
                </div>
                <Progress 
                  value={creditsPercentage} 
                  className="mt-2 h-2" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  1 credit = 1 image
                </p>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Processing accuracy
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Extraction Activity</CardTitle>
                <CardDescription>Tables extracted over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    tables: {
                      label: "Tables",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-[250px] w-full"
                >
                  <BarChart data={stats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="tables"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Processing Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Processing Overview</CardTitle>
                <CardDescription>Your extraction statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Documents Processed Today</span>
                    </div>
                    <Badge variant="secondary">{stats.processedToday}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">This Week</span>
                    </div>
                    <Badge variant="secondary">{stats.processedThisWeek}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">This Month</span>
                    </div>
                    <Badge variant="secondary">{stats.processedThisMonth}</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Avg. Processing Time</span>
                    </div>
                    <Badge variant="outline">{stats.averageProcessingTime}s</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Files className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Total All Time</span>
                    </div>
                    <Badge variant="outline">{stats.totalProcessed}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="default"
                    className="w-full justify-between"
                    onClick={() => router.push('/dashboard/client')}
                  >
                    <span className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Process Images
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => router.push('/history')}
                  >
                    <span className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      View History
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Jobs */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Jobs</CardTitle>
                  <CardDescription>Your latest processing jobs</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading...
                    </div>
                  ) : stats.recentJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <FileSpreadsheet className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No jobs yet</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => router.push('/dashboard/client')}
                      >
                        Process Images
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stats.recentJobs.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Image className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px]">
                                {job.filename}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {job.tables} table{job.tables !== 1 ? 's' : ''} from {job.images} image{job.images !== 1 ? 's' : ''} • {
                                  new Date(job.created_at).toLocaleDateString()
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                job.status === 'completed'
                                  ? 'default'
                                  : job.status === 'processing'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="text-xs"
                            >
                              {job.status}
                            </Badge>
                            {job.status === 'completed' && (
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => router.push('/history')}
                      >
                        View All Jobs
                        <ArrowUpRight className="h-3 w-3 ml-2" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upgrade Section */}
          <Card className="mt-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Upgrade to Pro</h3>
                  <p className="text-sm text-muted-foreground">
                    Process unlimited images with faster processing
                  </p>
                </div>
              </div>
              <Button variant="default" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type DateFilter = '1day' | '3days' | '7days' | '30days'

interface DashboardStats {
  totalProcessed: number
  tablesExtracted: number
  imagesProcessed: number
  creditsUsed: number
  totalCredits: number
  averageProcessingTime: number
  dateRange: {
    from: Date
    to: Date
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [dateFilter, setDateFilter] = useState<DateFilter>('1day')
  const [stats, setStats] = useState<DashboardStats>({
    totalProcessed: 0,
    tablesExtracted: 0,
    imagesProcessed: 0,
    creditsUsed: 0,
    totalCredits: 80, // 80 images per account
    averageProcessingTime: 0,
    dateRange: {
      from: new Date(),
      to: new Date()
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/sign-in')
    }
  }, [user, authLoading, router])

  // Calculate date range based on filter
  const getDateRange = (filter: DateFilter): { from: Date; to: Date } => {
    const now = new Date()
    const to = new Date(now)
    to.setHours(23, 59, 59, 999)
    
    const from = new Date(now)
    from.setHours(0, 0, 0, 0)
    
    switch (filter) {
      case '1day':
        // Today
        break
      case '3days':
        from.setDate(from.getDate() - 2)
        break
      case '7days':
        from.setDate(from.getDate() - 6)
        break
      case '30days':
        from.setDate(from.getDate() - 29)
        break
    }
    
    return { from, to }
  }

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

        // Fetch user profile for credits
        const { data: profile } = await supabase
          .from('profiles')
          .select('usage_credits, plan_type')
          .eq('id', user.id)
          .single()

        // Get date range based on current filter
        const dateRange = getDateRange(dateFilter)
        
        // Filter jobs by date range
        const filteredJobs = jobs.filter((job: any) => {
          const jobDate = new Date(job.created_at)
          return jobDate >= dateRange.from && jobDate <= dateRange.to
        })

        // Calculate stats for filtered period
        const tablesExtracted = filteredJobs.reduce((sum: number, job: any) => 
          sum + (job.processing_metadata?.total_images || 1), 0)
        
        const imagesProcessed = filteredJobs.reduce((sum: number, job: any) => 
          sum + (job.processing_metadata?.total_images || 1), 0)

        // Calculate credits (80 total, 1 per image) - monthly
        const thisMonth = new Date()
        thisMonth.setDate(1)
        thisMonth.setHours(0, 0, 0, 0)
        
        const monthJobs = jobs.filter((job: any) => 
          new Date(job.created_at) >= thisMonth
        )
        
        const creditsUsed = monthJobs.reduce((sum: number, job: any) => 
          sum + (job.processing_metadata?.total_images || 1), 0)

        // Calculate average processing time (mock data for now)
        const averageProcessingTime = 2.3

        setStats({
          totalProcessed: jobs.length,
          tablesExtracted,
          imagesProcessed,
          creditsUsed: Math.min(creditsUsed, 80),
          totalCredits: 80,
          averageProcessingTime,
          dateRange
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, dateFilter])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')  // Redirect to landing page instead of sign-in
  }

  const sidebarItems = [
    { icon: Activity, label: "Overview", href: "/dashboard", active: true },
    { icon: Upload, label: "Process Images", href: "/dashboard/upload-type" },
    { icon: History, label: "Saved Files", href: "/history" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
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
    <TooltipProvider>
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
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10">
                  {user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.user_metadata?.full_name || user.user_metadata?.name || user.email}
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
        <div className="container max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold mb-1">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  {stats.dateRange.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {stats.dateRange.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              
              {/* Date Filter Tabs */}
              <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                <Tabs value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)} className="w-full sm:w-auto">
                  <TabsList className="grid grid-cols-4 w-full sm:inline-flex">
                    <TabsTrigger value="1day" className="text-xs sm:text-sm px-2 sm:px-3">1D</TabsTrigger>
                    <TabsTrigger value="3days" className="text-xs sm:text-sm px-2 sm:px-3">3D</TabsTrigger>
                    <TabsTrigger value="7days" className="text-xs sm:text-sm px-2 sm:px-3">7D</TabsTrigger>
                    <TabsTrigger value="30days" className="text-xs sm:text-sm px-2 sm:px-3">30D</TabsTrigger>
                  </TabsList>
                </Tabs>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="p-1.5 hover:bg-accent rounded-md transition-colors">
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[280px]">
                    <p className="font-semibold mb-1">Time Period Filter</p>
                    <p className="text-xs text-muted-foreground">
                      Filter your extraction metrics by different time periods. This affects the "Tables Extracted" and "Images Processed" counts.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Credits Warning */}
            {stats.totalCredits - stats.creditsUsed <= 10 && stats.totalCredits - stats.creditsUsed > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3">
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
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
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
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 mb-4 sm:mb-6 lg:mb-8">
            {/* Tables Extracted */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-1 cursor-help">
                      Tables Extracted
                      <HelpCircle className="h-4 w-4" />
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[250px]">
                    <p>Number of tables successfully extracted from images in the selected time period</p>
                  </TooltipContent>
                </Tooltip>
                <Table className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.tablesExtracted}</div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  In selected period
                </p>
              </CardContent>
            </Card>

            {/* Images Processed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-1 cursor-help">
                      Images Processed
                      <HelpCircle className="h-4 w-4" />
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[250px]">
                    <p>Total number of images uploaded and processed during the selected period</p>
                  </TooltipContent>
                </Tooltip>
                <Image className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">{stats.imagesProcessed}</div>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Total documents
                </p>
              </CardContent>
            </Card>

            {/* Credits Available */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-1 cursor-help">
                      Monthly Credits
                      <HelpCircle className="h-4 w-4" />
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[250px]">
                    <p>Your monthly credit allocation. Each image costs 1 credit. Credits reset on the 1st of each month.</p>
                  </TooltipContent>
                </Tooltip>
                <CreditIcon className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold">
                    {stats.totalCredits - stats.creditsUsed}
                  </span>
                  <span className="text-muted-foreground">/ {stats.totalCredits}</span>
                </div>
                <Progress 
                  value={creditsPercentage} 
                  className="mt-3 h-2" 
                />
                <p className="text-xs text-muted-foreground mt-2">
                  1 credit = 1 image • Resets monthly
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Processing Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Processing Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Avg. Processing Time</p>
                      <p className="text-xs text-muted-foreground">Per image</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold">{stats.averageProcessingTime}s</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Files className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Processed</p>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </div>
                  </div>
                  <span className="text-lg font-semibold">{stats.totalProcessed}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start h-auto py-4"
                  onClick={() => router.push('/dashboard/upload-type')}
                >
                  <Upload className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">Process Images</p>
                    <p className="text-xs text-primary-foreground/80">Upload and extract tables</p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-auto py-4"
                  onClick={() => router.push('/history')}
                >
                  <History className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">View History</p>
                    <p className="text-xs text-muted-foreground">Access saved files</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
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
      
      {/* Mobile Navigation */}
      <MobileNav 
        isAuthenticated={true} 
        user={{
          email: user?.email,
          name: user?.user_metadata?.full_name,
          credits: (stats.totalCredits - stats.creditsUsed) || 0
        }}
      />
    </TooltipProvider>
  )
}

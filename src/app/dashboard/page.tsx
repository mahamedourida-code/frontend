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
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardStats {
  totalProcessed: number
  processingToday: number
  creditsUsed: number
  totalCredits: number
  activeJobs: number
  recentJobs: Array<{
    id: string
    filename: string
    status: string
    images: number
    created_at: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalProcessed: 0,
    processingToday: 0,
    creditsUsed: 0,
    totalCredits: 100,
    activeJobs: 0,
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
        
        // Fetch user's processing jobs
        const jobsResponse = await supabase
          .from('processing_jobs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        const jobs = jobsResponse.data as any[] | null

        // Fetch user profile for credits
        const profileResponse = await supabase
          .from('profiles')
          .select('usage_credits, plan_type')
          .eq('id', user.id)
          .single()
        const profile = profileResponse.data as any | null

        // Calculate stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const todayJobs = jobs?.filter((job: any) => 
          new Date(job.created_at) >= today
        ) || []

        const activeJobs = jobs?.filter((job: any) => 
          job.status === 'processing' || job.status === 'pending'
        ) || []

        setStats({
          totalProcessed: jobs?.length || 0,
          processingToday: todayJobs.length,
          creditsUsed: 100 - (profile?.usage_credits || 0),
          totalCredits: 100,
          activeJobs: activeJobs.length,
          recentJobs: (jobs || []).map((job: any) => ({
            id: job.id,
            filename: job.filename || 'Unnamed',
            status: job.status || 'pending',
            images: job.processing_metadata?.total_images || 1,
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
    router.push('/sign-in')
  }

  const sidebarItems = [
    { icon: Activity, label: "Overview", href: "/dashboard", active: true },
    { icon: Upload, label: "Process Images", href: "/dashboard/client" },
    { icon: History, label: "History", href: "/history" },
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
          {/* User Profile */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
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
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Processed
                </CardTitle>
                <Files className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProcessed}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Activity
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.processingToday}</div>
                <p className="text-xs text-muted-foreground">Files processed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Credits Available
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalCredits - stats.creditsUsed}
                </div>
                <Progress value={creditsPercentage} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Jobs
                </CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeJobs}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
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
                                {job.images} image{job.images !== 1 ? 's' : ''} • {
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

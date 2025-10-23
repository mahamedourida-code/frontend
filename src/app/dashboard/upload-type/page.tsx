"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/MobileNav"
import { FileText, TableProperties, Sparkles, LayoutDashboard, ArrowLeft, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"

export default function UploadTypePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [availableCredits, setAvailableCredits] = useState<number>(80)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserCredits()
    }
  }, [user])

  const fetchUserCredits = async () => {
    try {
      // Calculate credits from all processed images (just like dashboard)
      const supabase = createClient()
      const { data: allJobs } = await supabase
        .from('processing_jobs')
        .select('processing_metadata')
        .eq('user_id', user?.id || '')
      
      const typedAllJobs = (allJobs || []) as any[]
      const totalImagesProcessed = typedAllJobs.reduce((sum, job) => 
        sum + (job.processing_metadata?.total_images || 1), 0)

      // Simple credit calculation - 80 total, minus what's been used
      const TOTAL_CREDITS = 80
      const creditsAvailable = Math.max(0, TOTAL_CREDITS - totalImagesProcessed)
      
      setAvailableCredits(creditsAvailable)
    } catch (error) {
      console.error('Error fetching credits:', error)
      setAvailableCredits(80) // Default to full credits on error
    } finally {
      setLoading(false)
    }
  }

  const isOutOfCredits = availableCredits <= 0

  const tableTypes = [
    {
      id: "handwritten",
      title: "Handwritten",
      subtitle: "Notes & forms",
      icon: FileText
    },
    {
      id: "printed", 
      title: "Digital",
      subtitle: "Screenshots & PDFs",
      icon: TableProperties
    },
    {
      id: "auto",
      title: "Auto-Detect",
      subtitle: "Let AI decide",
      icon: Sparkles,
      recommended: true
    }
  ]

  const handleTypeSelect = (typeId: string) => {
    // Directly navigate when user selects an option
    router.push(`/dashboard/client?type=${typeId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b bg-white dark:bg-gray-900">
        <div className="container flex h-12 lg:h-14 max-w-5xl items-center justify-between px-3 sm:px-4 lg:px-6">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-7 w-7 lg:h-8 lg:w-8"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Button>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white dark:bg-white border-2 border-primary shadow-sm">
              <h1 className="text-xs lg:text-sm font-semibold text-foreground">Select Type</h1>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            size="sm"
            className="gap-1.5 h-7 lg:h-8"
          >
            <LayoutDashboard className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
            <span className="hidden sm:inline text-xs">Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="w-full max-w-3xl">
          {/* Out of Credits Alert */}
          {isOutOfCredits && (
            <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 mb-3">
              <CardContent className="flex items-center gap-2 p-3">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-600 text-xs lg:text-sm">Out of Credits</h3>
                  <p className="text-[11px] lg:text-xs text-red-600/80 mt-0.5">
                    You've used all your monthly credits. Credits reset next month.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Credits Available Display */}
          {!isOutOfCredits && !loading && (
            <div className="text-center mb-3">
              <p className="text-[11px] lg:text-xs text-muted-foreground">
                You have <span className="font-semibold text-foreground">{availableCredits}</span> credits available
              </p>
            </div>
          )}

          {/* Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-4">
            {tableTypes.map((type) => {
              const Icon = type.icon

              return (
                <button
                  key={type.id}
                  onClick={() => !isOutOfCredits && handleTypeSelect(type.id)}
                  disabled={isOutOfCredits}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-4 lg:p-6",
                    "bg-white dark:bg-white rounded-xl border-2 border-primary shadow-lg shadow-primary/10",
                    "transition-all duration-200",
                    isOutOfCredits ? (
                      "opacity-50 cursor-not-allowed"
                    ) : (
                      "hover:shadow-xl hover:shadow-primary/20 hover:scale-105"
                    )
                  )}
                >
                  {type.recommended && (
                    <div className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2">
                      <span className="text-[9px] lg:text-[10px] font-semibold text-primary uppercase tracking-wide">
                        RECOMMENDED
                      </span>
                    </div>
                  )}

                  <Icon className="h-8 w-8 lg:h-10 lg:w-10 mb-2 lg:mb-3 text-primary group-hover:scale-110 transition-transform" />

                  <h3 className="text-sm lg:text-base font-semibold text-foreground mb-0.5">
                    {type.title}
                  </h3>

                  <p className="text-[11px] lg:text-xs text-muted-foreground">
                    {type.subtitle}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Help text */}
          <p className="text-center mt-3 lg:mt-5 text-[11px] lg:text-xs text-muted-foreground">
            Select an option to continue. Exceletto will optimize based on your choice.
          </p>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav isAuthenticated={true} user={user} />
    </div>
  )
}

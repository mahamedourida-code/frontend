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
        <div className="container flex h-14 lg:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 lg:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 lg:h-9 lg:w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base lg:text-lg font-semibold">Select Document Type</h1>
              <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">Choose how to process your images</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            size="sm"
            className="gap-2 h-8 lg:h-9"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          {/* Out of Credits Alert */}
          {isOutOfCredits && (
            <Card className="border-red-500 bg-red-50 dark:bg-red-950/20 mb-4">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-600 text-sm lg:text-lg">Out of Credits</h3>
                  <p className="text-xs lg:text-sm text-red-600/80 mt-0.5">
                    You've used all your monthly image processing credits. Your credits will reset next month.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Credits Available Display */}
          {!isOutOfCredits && !loading && (
            <div className="text-center mb-4">
              <p className="text-xs lg:text-sm text-muted-foreground">
                You have <span className="font-semibold text-foreground">{availableCredits}</span> credits available
              </p>
            </div>
          )}

          {/* Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
            {tableTypes.map((type) => {
              const Icon = type.icon

              return (
                <button
                  key={type.id}
                  onClick={() => !isOutOfCredits && handleTypeSelect(type.id)}
                  disabled={isOutOfCredits}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-6 lg:p-10",
                    "bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800",
                    "transition-all duration-200",
                    isOutOfCredits ? (
                      "opacity-50 cursor-not-allowed"
                    ) : (
                      "hover:border-gray-900 dark:hover:border-gray-100 hover:shadow-xl hover:scale-105"
                    )
                  )}
                >
                  {type.recommended && (
                    <div className="absolute top-2 right-2 lg:top-3 lg:right-3">
                      <span className="text-[10px] lg:text-xs font-medium text-gray-500 dark:text-gray-400">
                        RECOMMENDED
                      </span>
                    </div>
                  )}

                  <Icon className="h-10 w-10 lg:h-12 lg:w-12 mb-3 lg:mb-4 text-gray-900 dark:text-gray-100 group-hover:scale-110 transition-transform" />

                  <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-0.5 lg:mb-1">
                    {type.title}
                  </h3>

                  <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                    {type.subtitle}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Help text */}
          <p className="text-center mt-4 lg:mt-8 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
            Select an option to continue. Exceletto will optimize processing based on your choice.
          </p>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav isAuthenticated={true} user={user} />
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/MobileNav"
import { FileText, TableProperties, Sparkles, LayoutDashboard, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { wakeUpBackendSilently } from "@/lib/backend-health"
import { useAuth } from "@/hooks/useAuth"

export default function UploadTypePage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    // Silently wake up backend when page loads - no blocking
    wakeUpBackendSilently()
  }, [])

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
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Select Document Type</h1>
              <p className="text-sm text-muted-foreground">Choose how to process your images</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="gap-2"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">

        <div className="w-full max-w-4xl">
          {/* Option Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {tableTypes.map((type) => {
              const Icon = type.icon
              
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-8 sm:p-10",
                    "bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-800",
                    "hover:border-gray-900 dark:hover:border-gray-100 transition-all duration-200",
                    "hover:shadow-xl hover:scale-105"
                  )}
                >
                  {type.recommended && (
                    <div className="absolute top-3 right-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        RECOMMENDED
                      </span>
                    </div>
                  )}
                  
                  <Icon className="h-12 w-12 mb-4 text-gray-900 dark:text-gray-100 group-hover:scale-110 transition-transform" />
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {type.title}
                  </h3>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {type.subtitle}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Help text */}
          <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            Select an option to continue. Exceletto will optimize processing based on your choice.
          </p>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}

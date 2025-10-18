"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MobileNav } from "@/components/MobileNav"
import { PenTool, Monitor, Sparkles, ArrowRight, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export default function UploadTypePage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const tableTypes = [
    {
      id: "handwritten",
      title: "Handwritten Tables",
      description: "Transform handwritten notes, forms, and tables into digital spreadsheets",
      icon: PenTool,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      hoverBg: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      examples: ["Handwritten notes", "Paper forms", "Manual ledgers"]
    },
    {
      id: "printed",
      title: "Printed Tables",
      description: "Process computer-generated tables, screenshots, and digital documents",
      icon: Monitor,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      borderColor: "border-purple-200 dark:border-purple-800",
      hoverBg: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
      examples: ["Screenshots", "PDF tables", "Digital reports"]
    },
    {
      id: "auto",
      title: "Auto-Detect",
      description: "Let our AI automatically identify and process your table type",
      icon: Sparkles,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      hoverBg: "hover:bg-emerald-100 dark:hover:bg-emerald-900/30",
      examples: ["Mixed documents", "Unsure?", "Best accuracy"],
      badge: "Recommended"
    }
  ]

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
  }

  const handleContinue = () => {
    if (selectedType) {
      router.push(`/dashboard/client?type=${selectedType}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              ← Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-24">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="outline" className="mb-3 border-primary/50 text-primary">
            Step 1 of 2
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Select Your Document Type
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the type of table you're uploading for optimized processing accuracy
          </p>
        </div>

        {/* Type Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {tableTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedType === type.id

            return (
              <Card
                key={type.id}
                className={cn(
                  "relative cursor-pointer transition-all duration-200 hover:shadow-lg",
                  isSelected
                    ? "ring-2 ring-primary shadow-lg"
                    : "hover:border-primary/50",
                  type.borderColor
                )}
                onClick={() => handleTypeSelect(type.id)}
              >
                {/* Selected Badge */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                )}

                {/* Recommended Badge */}
                {type.badge && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="default" className="text-xs">
                      {type.badge}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-3",
                      type.bgColor
                    )}
                  >
                    <Icon className={cn("h-6 w-6", type.iconColor)} />
                  </div>
                  <CardTitle className="text-xl">{type.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {type.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Best for:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {type.examples.map((example, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs"
                        >
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selectedType}
            onClick={handleContinue}
            className="min-w-[200px] text-base px-6 py-5 h-auto"
          >
            Continue to Upload
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Not sure which to choose?{" "}
            <button
              className="text-primary hover:underline font-medium"
              onClick={() => handleTypeSelect("auto")}
            >
              Use Auto-Detect
            </button>{" "}
            for best results
          </p>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
}

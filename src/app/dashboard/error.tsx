'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('[Dashboard Error]:', error)

    // Clear any stuck processing state
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('wasProcessing')
      sessionStorage.removeItem('uploadedFilesCache')
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="max-w-md w-full border-destructive/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>

            <h2 className="text-xl font-bold text-foreground mb-2">
              Something went wrong
            </h2>

            <p className="text-sm text-muted-foreground mb-6">
              {error.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>

            <div className="flex gap-3 w-full">
              <Button
                onClick={() => window.location.href = '/dashboard'}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>

              <Button
                onClick={() => reset()}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>

            {error.digest && (
              <p className="text-xs text-muted-foreground mt-4">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

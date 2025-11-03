'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('[Error Boundary] Caught error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Something went wrong!</h2>
        <p className="text-muted-foreground">
          An error occurred while processing your request. Please try again.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-muted-foreground break-all">
              {error.message}
            </p>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Go Home
          </Button>
          <Button
            onClick={() => reset()}
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}

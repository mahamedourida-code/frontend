'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [forceShowContent, setForceShowContent] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
    }
  }, [user, loading])

  // SAFETY NET: If loading state persists for >10 seconds, force show content or redirect
  // This prevents infinite loading if AuthContext has issues
  useEffect(() => {
    if (loading) {
      const timeoutId = setTimeout(() => {
        if (!user) {
          router.push('/')
        } else {
          setForceShowContent(true)
        }
      }, 10000) // 10 second maximum loading time

      return () => clearTimeout(timeoutId)
    }
  }, [loading, user, router])

  // Show loading state (but not forever)
  if (loading && !forceShowContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
          <p className="text-xs text-muted-foreground mt-2">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render protected content if no user
  if (!user) {
    return null
  }

  return <>{children}</>
}

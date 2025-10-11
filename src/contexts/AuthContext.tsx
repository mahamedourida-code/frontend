'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'
import { AuthErrorBoundary } from '@/components/AuthErrorBoundary'

interface AuthContextType {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  
  // Initialize Supabase client
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    console.log('[AuthContext] Initializing auth...')
    let mounted = true
    let timeoutId: NodeJS.Timeout
    let retryCount = 0
    const maxRetries = 3

    // Set a more reasonable timeout (15 seconds instead of 5)
    // This prevents premature timeout on slower connections
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('[AuthContext] Session check timeout after 15s - setting loading to false')
        setLoading(false)
      }
    }, 15000) // 15 second timeout

    // Clean up any leftover session storage flags
    if (typeof window !== 'undefined') {
      const keysToClean = ['in2FAFlow', 'in2FAFlowTimestamp', 'otpVerified']
      keysToClean.forEach(key => sessionStorage.removeItem(key))
    }

    // Session check with retry logic
    const checkSession = async () => {
      try {
        if (!mounted) return

        console.log('[AuthContext] Checking session...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (!mounted) return

        // Clear timeout since we got a response
        clearTimeout(timeoutId)

        if (error) {
          console.error('[AuthContext] Error getting session:', error)

          // Retry logic for network issues
          if (retryCount < maxRetries && (error.message?.includes('network') || error.message?.includes('timeout'))) {
            retryCount++
            console.log(`[AuthContext] Retrying session check (${retryCount}/${maxRetries})...`)
            setTimeout(checkSession, 1000 * retryCount) // Exponential backoff
            return
          }

          // If all retries failed or it's not a retryable error
          setSession(null)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        console.log('[AuthContext] Session check successful:', session ? 'authenticated' : 'anonymous')

        // Session recovery: validate session is still valid
        if (session) {
          try {
            const { data: user, error: userError } = await supabase.auth.getUser()
            if (userError || !user.user) {
              console.warn('[AuthContext] Invalid session detected, clearing...')
              await supabase.auth.signOut({ scope: 'local' })
              setSession(null)
              setUser(null)
              setProfile(null)
              setLoading(false)
              return
            }
          } catch (validationError) {
            console.error('[AuthContext] Session validation failed:', validationError)
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
            return
          }
        }

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id).finally(() => {
            if (mounted) setLoading(false)
          })
        } else {
          setProfile(null)
          setLoading(false)
        }
      } catch (error) {
        if (!mounted) return
        clearTimeout(timeoutId)
        console.error('[AuthContext] Exception during session check:', error)
        setSession(null)
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    }

    // Start the session check
    checkSession()

    // Debounce mechanism for auth state changes
    let authChangeTimeout: NodeJS.Timeout | null = null
    let lastAuthEvent: string | null = null

    // Listen for auth changes with debouncing
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      // Debounce rapid auth state changes
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout)
      }

      // If we get the same event twice quickly, ignore the second one
      if (lastAuthEvent === event && Date.now() - (window as any).lastAuthEventTime < 1000) {
        console.log('[AuthContext] Debouncing duplicate auth event:', event)
        return
      }

      lastAuthEvent = event
      ;(window as any).lastAuthEventTime = Date.now()

      authChangeTimeout = setTimeout(async () => {
        console.log('[AuthContext] Processing auth state change:', event, session?.user?.email)

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)

          // Handle SIGNED_IN event - redirect from auth pages to dashboard
          if (event === 'SIGNED_IN') {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
            console.log('[AuthContext] SIGNED_IN event, current path:', currentPath)

            // Redirect from auth pages to dashboard
            const authPages = ['/sign-in', '/sign-up', '/verify-email']
            const isOnAuthPage = authPages.some(page => currentPath?.includes(page))

            if (isOnAuthPage) {
              console.log('[AuthContext] Redirecting authenticated user to dashboard...')
              // Add a small delay to ensure auth state is fully settled
              setTimeout(() => router.push('/dashboard'), 100)
            } else {
              console.log('[AuthContext] User signed in, already on correct page:', currentPath)
            }
          }

          // Handle TOKEN_REFRESHED event
          if (event === 'TOKEN_REFRESHED') {
            console.log('[AuthContext] Token refreshed successfully')
          }
        } else {
          // No session - clear profile
          setProfile(null)

          // Handle SIGNED_OUT event
          if (event === 'SIGNED_OUT') {
            console.log('[AuthContext] User signed out')
            // Clear any remaining session flags
            if (typeof window !== 'undefined') {
              const keysToClean = ['in2FAFlow', 'in2FAFlowTimestamp', 'otpVerified']
              keysToClean.forEach(key => sessionStorage.removeItem(key))
            }
          }
        }

        setLoading(false)
      }, 300) // 300ms debounce delay
    })

    return () => {
      console.log('[AuthContext] Cleaning up auth subscription')
      mounted = false
      clearTimeout(timeoutId)
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout)
      }
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array to prevent loops

  const signOut = async () => {
    console.log('[AuthContext] AuthContext signOut called...')

    try {
      // Use the improved signOut helper which handles comprehensive cleanup
      await (await import('@/lib/auth-helpers')).signOut()

      // Clear local state
      setUser(null)
      setSession(null)
      setProfile(null)

      console.log('[AuthContext] Auth context state cleared')
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error)

      // Even if signOut fails, clear local state to prevent stuck UI
      setUser(null)
      setSession(null)
      setProfile(null)
    }
  }

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider
        value={{
          user,
          session,
          profile,
          loading,
          signOut,
          refreshProfile,
        }}
      >
        {children}
      </AuthContext.Provider>
    </AuthErrorBoundary>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

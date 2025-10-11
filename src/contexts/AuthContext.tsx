'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types/database'

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
    let flagCleanupId: NodeJS.Timeout

    // CRITICAL: Set timeout to prevent stuck loading state
    // If session check takes >5 seconds, consider it failed and stop loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.error('[AuthContext] Session check timeout - forcing loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

    // Safety mechanism: Clear stale 2FA flags after 10 minutes
    // This handles cases where user abandons the 2FA flow
    const check2FAFlagAge = () => {
      if (typeof window !== 'undefined') {
        const flagTimestamp = sessionStorage.getItem('in2FAFlowTimestamp')
        const flag = sessionStorage.getItem('in2FAFlow')

        if (flag === 'true' && flagTimestamp) {
          const age = Date.now() - parseInt(flagTimestamp, 10)
          const tenMinutes = 10 * 60 * 1000

          if (age > tenMinutes) {
            console.warn('[AuthContext] Clearing stale 2FA flag (older than 10 minutes)')
            sessionStorage.removeItem('in2FAFlow')
            sessionStorage.removeItem('in2FAFlowTimestamp')
          }
        }
      }
    }

    // Check immediately and set interval to check every minute
    check2FAFlagAge()
    flagCleanupId = setInterval(check2FAFlagAge, 60000) // Check every minute

    // Get initial session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return

        // Clear timeout since we got a response
        clearTimeout(timeoutId)

        if (error) {
          console.error('[AuthContext] Error getting session:', error)
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }

        console.log('[AuthContext] Initial session:', session ? 'exists' : 'none')
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          fetchProfile(session.user.id).finally(() => {
            if (mounted) setLoading(false)
          })
        } else {
          setLoading(false)
        }
      })
      .catch((error) => {
        if (!mounted) return
        clearTimeout(timeoutId)
        console.error('[AuthContext] Exception getting session:', error)
        setSession(null)
        setUser(null)
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('[AuthContext] Auth state changed:', event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)

        // Handle SIGNED_IN event with proper 2FA detection
        if (event === 'SIGNED_IN') {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
          console.log('[AuthContext] SIGNED_IN event, current path:', currentPath)

          // Check if we're in 2FA flow
          const in2FAFlow = typeof window !== 'undefined' && sessionStorage.getItem('in2FAFlow') === 'true'

          if (in2FAFlow) {
            console.log('[AuthContext] In 2FA flow - skipping auto-redirect')
            // Don't redirect, user is still completing 2FA
          } else {
            // Normal sign-in flow - redirect from auth pages to dashboard
            const authPages = ['/sign-in', '/sign-up', '/verify-email']
            const isOnAuthPage = authPages.some(page => currentPath?.includes(page))

            if (isOnAuthPage) {
              console.log('[AuthContext] Redirecting authenticated user to dashboard...')
              router.push('/dashboard')
            } else {
              console.log('[AuthContext] User signed in, already on correct page:', currentPath)
            }
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
            sessionStorage.removeItem('in2FAFlow')
            sessionStorage.removeItem('in2FAFlowTimestamp')
          }
        }
      }

      setLoading(false)
    })

    return () => {
      console.log('[AuthContext] Cleaning up auth subscription')
      mounted = false
      clearTimeout(timeoutId)
      clearInterval(flagCleanupId)
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array to prevent loops

  const signOut = async () => {
    console.log('[AuthContext] Signing out...')

    // Clear session storage flags
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('in2FAFlow')
      sessionStorage.removeItem('in2FAFlowTimestamp')
      sessionStorage.removeItem('wasProcessing')
      sessionStorage.removeItem('uploadedFilesCache')
    }

    // Sign out from Supabase
    await supabase.auth.signOut({
      scope: 'local'
    })

    // Clear state
    setUser(null)
    setSession(null)
    setProfile(null)

    console.log('[AuthContext] Sign out complete')
  }

  return (
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
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

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

    // CRITICAL: Set timeout to prevent stuck loading state
    // If session check takes >5 seconds, consider it failed and stop loading
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.error('[AuthContext] Session check timeout - forcing loading to false')
        setLoading(false)
      }
    }, 5000) // 5 second timeout

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

        // If user just signed in and we're on auth page, redirect to dashboard
        // BUT: Skip auto-redirect if we're in the middle of 2FA flow
        if (event === 'SIGNED_IN') {
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
          console.log('[AuthContext] SIGNED_IN event, current path:', currentPath)

          const in2FAFlow = typeof window !== 'undefined' && sessionStorage.getItem('in2FAFlow') === 'true'

          if (in2FAFlow) {
            console.log('[AuthContext] In 2FA flow, skipping auto-redirect')
          } else {
            const authPages = ['/sign-in', '/sign-up', '/verify-email']
            if (authPages.some(page => currentPath?.includes(page))) {
              console.log('[AuthContext] Redirecting to dashboard...')
              router.push('/dashboard')
            }
          }
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      console.log('[AuthContext] Cleaning up auth subscription')
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array to prevent loops

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
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

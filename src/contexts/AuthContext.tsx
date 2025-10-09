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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthContext] Auth state changed:', event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)

        // If user just signed in and we're on auth page, redirect to dashboard
        // BUT: Skip auto-redirect if we're in the middle of 2FA flow
        if (event === 'SIGNED_IN') {
          // Use window.location.pathname instead of pathname from hook to avoid dependency
          const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
          console.log('[AuthContext] SIGNED_IN event, current path:', currentPath)

          // Check if we're in 2FA flow (flag set by sign-in page)
          const in2FAFlow = typeof window !== 'undefined' && sessionStorage.getItem('in2FAFlow') === 'true'

          if (in2FAFlow) {
            console.log('[AuthContext] In 2FA flow, skipping auto-redirect')
            // Don't redirect - let the sign-in flow handle it
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
      subscription.unsubscribe()
    }
  }, []) // FIXED: Empty dependency array to prevent infinite loops

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

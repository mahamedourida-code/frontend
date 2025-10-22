'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/client'
import { Database } from '@/types/database.generated'

type Profile = Database['public']['Tables']['profiles']['Row']

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

  // Create Supabase client - each render gets a fresh client (correct for @supabase/ssr)
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
      console.error('[AuthContext] Error fetching profile:', error)
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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return

      if (error) {
        console.error('[AuthContext] Error getting session:', error)
        setLoading(false)
        return
      }

      console.log('[AuthContext] Initial session:', session ? 'authenticated' : 'anonymous')
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

    // Listen for auth changes - trust Supabase's event system
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('[AuthContext] Auth event:', event, session?.user?.email)

      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        await fetchProfile(session.user.id)

        // Redirect to dashboard on sign-in (only from auth pages)
        if (event === 'SIGNED_IN') {
          const currentPath = window.location.pathname
          const authPages = ['/sign-in', '/sign-up', '/verify-email']

          if (authPages.some(page => currentPath.includes(page))) {
            console.log('[AuthContext] Redirecting to dashboard after sign-in')
            router.push('/dashboard')
          }
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Register once on mount

  const signOut = async () => {
    console.log('[AuthContext] Signing out...')

    try {
      // Use the signOut helper
      await (await import('@/lib/auth-helpers')).signOut()

      // State will be cleared by onAuthStateChange SIGNED_OUT event
      console.log('[AuthContext] Sign out complete')
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error)
      // Clear local state even on error
      setUser(null)
      setSession(null)
      setProfile(null)
    }
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

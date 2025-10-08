import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    headers: {
      'X-Client-Info': 'olmocr-frontend',
    },
  },
})

/**
 * Get the current user's JWT access token from Supabase session
 * Returns null if no active session
 */
export async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[Supabase] Error getting session:', error)
      return null
    }
    
    if (!session) {
      console.log('[Supabase] No active session found')
      return null
    }
    
    // Check if token is expired or about to expire (within 5 minutes)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = session.expires_at || 0
    const timeUntilExpiry = expiresAt - now
    
    if (timeUntilExpiry < 300) { // Less than 5 minutes
      console.log('[Supabase] Token expires soon, refreshing...')
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('[Supabase] Error refreshing session:', refreshError)
        return null
      }
      
      if (refreshedSession) {
        console.log('[Supabase] Session refreshed successfully')
        return refreshedSession.access_token
      }
    }
    
    return session.access_token
  } catch (error) {
    console.error('[Supabase] Unexpected error getting access token:', error)
    return null
  }
}

/**
 * Get the current authenticated user
 * Returns null if no active session
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('[Supabase] Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('[Supabase] Unexpected error getting current user:', error)
    return null
  }
}

/**
 * Sign out the current user and clear all sessions
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[Supabase] Error signing out:', error)
      throw error
    }
    console.log('[Supabase] Signed out successfully')
  } catch (error) {
    console.error('[Supabase] Unexpected error during sign out:', error)
    throw error
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    console.error('[Supabase] Error checking authentication:', error)
    return false
  }
}

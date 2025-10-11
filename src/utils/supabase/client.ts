import { createBrowserClient, type SupabaseClient } from '@supabase/ssr'
import { Database } from '@/types/database'

// Singleton client instance
let supabaseClient: SupabaseClient<Database> | null = null

export function createClient() {
  // Return existing client if available (singleton pattern)
  if (supabaseClient) {
    return supabaseClient
  }

  // Create new client only if none exists
  supabaseClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development',
        // Add better session storage handling
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'olmocr-supabase-auth-token',
      },
      global: {
        headers: {
          'X-Client-Info': 'olmocr-frontend',
        },
      },
    }
  )

  return supabaseClient
}

// Helper function to reset the singleton (useful for testing or force refresh)
export function resetClient() {
  supabaseClient = null
}

// Helper function to get the current client without creating a new one
export function getClient() {
  return supabaseClient
}
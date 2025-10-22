import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.generated'

/**
 * Creates a Supabase client for browser-side operations
 *
 * IMPORTANT: This creates a NEW client instance each time.
 * This is the correct behavior for @supabase/ssr which handles
 * session management and cookie storage automatically.
 *
 * Do NOT create a singleton - it will cache stale auth state!
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

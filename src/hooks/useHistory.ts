'use client'

import { useState, useEffect, useCallback } from 'react'
import { ocrApi } from '@/lib/api-client'
import { toast } from 'sonner'

import { Database } from '@/types/database.generated'

type HistoryJob = Database['public']['Tables']['job_history']['Row']

interface UseHistoryReturn {
  jobs: HistoryJob[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  hasMore: boolean
  total: number
}

export function useHistory(): UseHistoryReturn {
  const [jobs, setJobs] = useState<HistoryJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Import and create Supabase client
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      // Get session first to ensure we have proper auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('[useHistory] Session check:', { hasSession: !!session, sessionError })
      
      if (sessionError) {
        console.error('[useHistory] Session error:', sessionError)
        // Don't throw, continue anyway since RLS is disabled
      }
      
      if (!session || !session.user) {
        console.warn('[useHistory] No active session, trying to fetch anyway...')
        // Since RLS is disabled, let's try to fetch all jobs for debugging
        const { data: allJobs, error: allError } = await supabase
          .from('job_history')
          .select('*')
          .limit(10)
        
        console.log('[useHistory] Debug - All jobs query result:', { allJobs, allError })
        
        if (allJobs && allJobs.length > 0) {
          console.log('[useHistory] Found jobs despite no session! First job user_id:', (allJobs[0] as any).user_id)
        }
        
        setJobs([])
        setTotal(0)
        setHasMore(false)
        return
      }

      const user = session.user
      console.log('[useHistory] User from session:', { id: user.id, email: user.email })

      // Now fetch from job_history table - RLS disabled so this should work
      console.log('[useHistory] Fetching job_history for user:', user.id)
      
      // Query with user_id filter
      const { data: historyJobs, error: fetchError, count } = await supabase
        .from('job_history')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })
        .limit(50)
      
      console.log('[useHistory] Query executed. Response:', { 
        historyJobs, 
        fetchError, 
        count,
        jobsLength: historyJobs?.length 
      })

      if (fetchError) {
        console.error('[useHistory] Error fetching job history:', fetchError)
        // If table doesn't exist, return empty array (not an error)
        if (fetchError.code === '42P01') {
          console.log('[useHistory] job_history table does not exist yet')
          setJobs([])
          setHasMore(false)
          setTotal(0)
          return
        }
        // Don't throw for other errors, just set empty state
        setJobs([])
        setHasMore(false)
        setTotal(0)
        return
      }

      // Successfully fetched data
      console.log('[useHistory] Successfully fetched', historyJobs?.length || 0, 'jobs')
      console.log('[useHistory] First job sample:', historyJobs?.[0])
      
      // Set the jobs directly - the history page will handle the field mapping
      setJobs(historyJobs || [])
      setHasMore((count || 0) > 50)
      setTotal(count || 0)
    } catch (err: any) {
      const errorMessage = err.detail || err.message || 'Failed to load history'
      setError(errorMessage)

      // Only show error toast if it's not an auth error (let the page handle auth errors)
      if (err.status_code !== 401 && !err.message?.includes('authenticated')) {
        toast.error(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    jobs,
    isLoading,
    error,
    refresh: fetchHistory,
    hasMore,
    total,
  }
}

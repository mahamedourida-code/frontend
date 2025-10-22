'use client'

import { useState, useEffect, useCallback } from 'react'
import { ocrApi } from '@/lib/api-client'
import { toast } from 'sonner'

interface HistoryJob {
  id?: string // The UUID primary key
  original_job_id?: string // The original job ID from processing
  job_id?: string // For backward compatibility
  filename: string
  status: string
  result_url: string | null
  created_at: string
  updated_at: string
  saved_at?: string
  processing_metadata?: any // Changed from metadata to processing_metadata
  metadata?: any // For backward compatibility
}

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
      // Skip backend for now - go directly to Supabase to debug
      // TODO: Re-enable backend after debugging
      /*
      try {
        console.log('[useHistory] Fetching from backend API...')
        const response = await ocrApi.getSavedHistory(50, 0)
        console.log('[useHistory] Backend response:', response)
        setJobs(response.jobs || [])
        setHasMore(response.has_more || false)
        setTotal(response.total || 0)
        return
      } catch (backendErr: any) {
        console.error('[useHistory] Backend fetch failed:', backendErr)
        console.log('[useHistory] Trying Supabase directly...')

        // If it's an auth error, don't try Supabase
        if (backendErr.status_code === 401) {
          throw backendErr
        }
      }
      */
      console.log('[useHistory] Going directly to Supabase for debugging...')

      // Fallback: Fetch directly from Supabase
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      // Fetch from job_history table
      console.log('[useHistory] Fetching from Supabase for user:', user.id)
      const { data: historyJobs, error: fetchError, count } = await supabase
        .from('job_history')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })
        .range(0, 49)
      
      console.log('[useHistory] Supabase response:', { historyJobs, fetchError, count })

      if (fetchError) {
        // If table doesn't exist, return empty array (not an error)
        if (fetchError.code === '42P01') {
          console.log('[useHistory] job_history table does not exist yet')
          setJobs([])
          setHasMore(false)
          setTotal(0)
          return
        }
        throw fetchError
      }

      // Map the data to match expected format
      const formattedJobs = (historyJobs || []).map(job => ({
        ...job,
        job_id: job.original_job_id || job.job_id,
        metadata: job.processing_metadata || job.metadata
      }))
      console.log('[useHistory] Formatted jobs:', formattedJobs)
      setJobs(formattedJobs)
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

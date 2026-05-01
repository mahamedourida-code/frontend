'use client'

import { useState, useEffect, useCallback } from 'react'
import { ocrApi } from '@/lib/api-client'
import { toast } from 'sonner'

export type HistoryJob = {
  id?: string
  original_job_id?: string | null
  filename?: string | null
  status?: string | null
  result_url?: string | null
  saved_at?: string | null
  created_at?: string | null
  processing_metadata?: Record<string, any> | null
  [key: string]: any
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
      const response = await ocrApi.getSavedHistory(50, 0)
      const historyJobs = Array.isArray(response)
        ? response
        : response.jobs || response.history || response.items || response.data || []
      const totalCount = response.total ?? response.count ?? historyJobs.length

      setJobs(historyJobs)
      setHasMore(Boolean(response.has_more ?? response.hasMore ?? totalCount > historyJobs.length))
      setTotal(totalCount)
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

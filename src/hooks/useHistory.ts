'use client'

import { useState, useEffect, useCallback } from 'react'
import { ocrApi } from '@/lib/api-client'
import { toast } from 'sonner'

interface HistoryJob {
  job_id: string
  filename: string
  status: string
  result_url: string | null
  created_at: string
  updated_at: string
  metadata: any
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
      // Use getSavedHistory instead of getHistory to fetch only saved jobs
      const response = await ocrApi.getSavedHistory(50, 0)
      setJobs(response.jobs || [])
      setHasMore(response.has_more || false)
      setTotal(response.total || 0)
    } catch (err: any) {
      const errorMessage = err.detail || 'Failed to load history'
      setError(errorMessage)

      // Only show error toast if it's not an auth error (let the page handle auth errors)
      if (err.status_code !== 401) {
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

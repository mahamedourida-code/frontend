'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ocrApi } from '@/lib/api-client'
import { reconcileHistoryDeletions } from '@/lib/recent-files-store'
import { toast } from 'sonner'

const HISTORY_PAGE_SIZE = 50

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
  loadMore: () => Promise<void>
  isLoadingMore: boolean
  hasMore: boolean
  total: number
}

function getHistoryJobs(response: any): HistoryJob[] {
  if (Array.isArray(response)) return response
  return response.jobs || response.history || response.items || response.data || []
}

function getHistoryJobId(job: HistoryJob): string | null {
  return job.original_job_id || job.job_id || job.id || null
}

function mergeHistoryJobs(current: HistoryJob[], incoming: HistoryJob[]): HistoryJob[] {
  const seen = new Set(current.map(getHistoryJobId).filter(Boolean))
  const merged = [...current]

  for (const job of incoming) {
    const jobId = getHistoryJobId(job)
    if (jobId && seen.has(jobId)) continue
    if (jobId) seen.add(jobId)
    merged.push(job)
  }

  return merged
}

export function useHistory(workspaceId?: string, enabled = true): UseHistoryReturn {
  const [jobs, setJobs] = useState<HistoryJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const jobsRef = useRef<HistoryJob[]>([])
  const nextOffsetRef = useRef(0)
  const requestVersionRef = useRef(0)
  const isLoadingRef = useRef(false)
  const isLoadingMoreRef = useRef(false)
  const loadedScopeRef = useRef<string | null>(null)
  const scopeKey = enabled ? workspaceId || 'workspace:none' : 'disabled'
  const currentScopeRef = useRef(scopeKey)
  currentScopeRef.current = scopeKey

  const fetchHistory = useCallback(async () => {
    const requestVersion = ++requestVersionRef.current
    const scopeChanged = loadedScopeRef.current !== scopeKey
    loadedScopeRef.current = scopeKey
    isLoadingRef.current = true
    isLoadingMoreRef.current = false
    setIsLoadingMore(false)

    if (scopeChanged) {
      jobsRef.current = []
      nextOffsetRef.current = 0
      setJobs([])
      setHasMore(false)
      setTotal(0)
    }

    if (!enabled) {
      setIsLoading(false)
      setError(null)
      isLoadingRef.current = false
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await ocrApi.getHistory(HISTORY_PAGE_SIZE, 0, workspaceId)
      if (requestVersion !== requestVersionRef.current || currentScopeRef.current !== scopeKey) return

      const historyJobs = getHistoryJobs(response)
      const totalCount = Array.isArray(response)
        ? historyJobs.length
        : response.total ?? response.count ?? historyJobs.length
      const responseHasMore = Array.isArray(response)
        ? false
        : response.has_more ?? response.hasMore ?? false
      const canLoadMore = Boolean(responseHasMore) || historyJobs.length === HISTORY_PAGE_SIZE

      jobsRef.current = historyJobs
      nextOffsetRef.current = historyJobs.length
      setJobs(historyJobs)
      setHasMore(canLoadMore)
      setTotal(Math.max(totalCount, historyJobs.length))

      // Drop any optimistic-delete marks the server has now confirmed gone, so the
      // durable set self-heals and never hides a legitimately-present row.
      reconcileHistoryDeletions(
        historyJobs.flatMap((job: HistoryJob) => [job.id, job.job_id, job.original_job_id]),
      )
    } catch (err: any) {
      if (requestVersion !== requestVersionRef.current || currentScopeRef.current !== scopeKey) return
      const errorMessage = err.detail || err.message || 'Failed to load history'
      setError(errorMessage)

      // Only show error toast if it's not an auth error (let the page handle auth errors)
      if (err.status_code !== 401 && !err.message?.includes('authenticated')) {
        toast.error(errorMessage)
      }
    } finally {
      if (requestVersion === requestVersionRef.current && currentScopeRef.current === scopeKey) {
        isLoadingRef.current = false
        setIsLoading(false)
      }
    }
  }, [enabled, scopeKey, workspaceId])

  const loadMore = useCallback(async () => {
    if (!enabled || !hasMore || isLoadingRef.current || isLoadingMoreRef.current) return

    const requestVersion = requestVersionRef.current
    const offset = nextOffsetRef.current
    isLoadingMoreRef.current = true
    setIsLoadingMore(true)
    setError(null)

    try {
      const response = await ocrApi.getHistory(HISTORY_PAGE_SIZE, offset, workspaceId)
      if (requestVersion !== requestVersionRef.current || currentScopeRef.current !== scopeKey) return

      const pageJobs = getHistoryJobs(response)
      const mergedJobs = mergeHistoryJobs(jobsRef.current, pageJobs)
      const totalCount = Array.isArray(response)
        ? mergedJobs.length
        : response.total ?? response.count ?? mergedJobs.length
      const responseHasMore = Array.isArray(response)
        ? false
        : response.has_more ?? response.hasMore ?? false

      jobsRef.current = mergedJobs
      nextOffsetRef.current = offset + pageJobs.length
      setJobs(mergedJobs)
      setHasMore(Boolean(responseHasMore) || pageJobs.length === HISTORY_PAGE_SIZE)
      setTotal(Math.max(totalCount, mergedJobs.length))
      reconcileHistoryDeletions(
        mergedJobs.flatMap((job: HistoryJob) => [job.id, job.job_id, job.original_job_id]),
      )
    } catch (err: any) {
      if (requestVersion !== requestVersionRef.current || currentScopeRef.current !== scopeKey) return
      const errorMessage = err.detail || err.message || 'Failed to load older history'
      setError(errorMessage)
      if (err.status_code !== 401 && !err.message?.includes('authenticated')) {
        toast.error(errorMessage)
      }
    } finally {
      if (requestVersion === requestVersionRef.current && currentScopeRef.current === scopeKey) {
        isLoadingMoreRef.current = false
        setIsLoadingMore(false)
      }
    }
  }, [enabled, hasMore, scopeKey, workspaceId])

  // Fetch on mount
  useEffect(() => {
    void fetchHistory()
    return () => {
      requestVersionRef.current += 1
      isLoadingRef.current = false
      isLoadingMoreRef.current = false
    }
  }, [fetchHistory])

  return {
    jobs,
    isLoading,
    error,
    refresh: fetchHistory,
    loadMore,
    isLoadingMore,
    hasMore,
    total,
  }
}

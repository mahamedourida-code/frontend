'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ocrApi, OCRWebSocket, BatchConvertResponse, JobStatusResponse } from '@/lib/api-client'
import { toast } from 'sonner'

interface UseOCRReturn {
  // State
  isUploading: boolean
  isProcessing: boolean
  uploadProgress: number
  jobId: string | null
  status: string | null
  progress: { total_images: number; processed_images: number; percentage: number } | null
  files: any[] | null
  error: string | null
  isSaved: boolean
  isSaving: boolean

  // Actions
  uploadImage: (file: File) => Promise<BatchConvertResponse | null>
  uploadBatch: (files: File[]) => Promise<BatchConvertResponse | null>
  getStatus: (jobId: string) => Promise<void>
  downloadFile: (fileId: string) => Promise<void>
  saveToHistory: () => Promise<void>
  connectWebSocket: (sessionId: string) => void
  disconnectWebSocket: () => void
  reset: () => void
}

export function useOCR(): UseOCRReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [jobId, setJobId] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null) // Track session ID for downloads
  const [status, setStatus] = useState<string | null>(null)
  const [progress, setProgress] = useState<any>(null)
  const [files, setFiles] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const wsRef = useRef<OCRWebSocket | null>(null) // Use ref instead of state for WebSocket
  const [hasShownCompletion, setHasShownCompletion] = useState(false) // Track if completion toast shown

  // Upload single image
  const uploadImage = useCallback(async (file: File): Promise<BatchConvertResponse | null> => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      const response = await ocrApi.uploadImage(file)
      setUploadProgress(100)
      setJobId(response.job_id)
      setStatus(response.success ? 'queued' : 'failed')
      toast.success('Image uploaded successfully!')
      return response
    } catch (err: any) {
      const errorMessage = err.detail || 'Failed to upload image'
      setError(errorMessage)
      toast.error(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  // Upload multiple images
  const uploadBatch = useCallback(async (files: File[]): Promise<BatchConvertResponse | null> => {
    console.log('[useOCR] uploadBatch called with', files.length, 'files')

    // Set processing state immediately for better UX
    setIsProcessing(true)
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
    setStatus('processing')
    setHasShownCompletion(false) // Reset completion flag for new batch

    try {
      console.log('[useOCR] Uploading files directly (multipart/form-data)...')

      // Use new multipart upload - NO BASE64 CONVERSION!
      // Files are sent as binary data directly, much faster and more efficient
      const response = await ocrApi.uploadBatchMultipart(files, {
        output_format: 'xlsx',
        consolidation_strategy: 'separate'  // Changed to separate to keep files individual
      })
      console.log('[useOCR] API response:', response)

      setUploadProgress(100)
      setJobId(response.job_id)
      setSessionId(response.session_id) // Store session ID for downloads
      setStatus(response.success ? 'processing' : 'failed')
      toast.success(`${files.length} images uploaded successfully!`)
      return response
    } catch (err: any) {
      console.error('[useOCR] Upload error:', err)
      const errorMessage = err.detail || err.message || 'Failed to upload images'
      setError(errorMessage)
      setIsProcessing(false) // Reset processing state on error
      toast.error(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  // Get job status
  const getStatus = useCallback(async (jobId: string): Promise<void> => {
    setIsProcessing(true)
    try {
      const response: JobStatusResponse = await ocrApi.getStatus(jobId)
      setStatus(response.status)
      setProgress(response.progress || null)

      if (response.results) {
        setFiles(response.results.files)
      }

      if (response.errors && response.errors.length > 0) {
        setError(response.errors.join(', '))
        toast.error(response.errors[0])
      }

      if (response.status === 'completed') {
        toast.success('Processing completed!')
        setIsProcessing(false)
      } else if (response.status === 'failed') {
        toast.error('Processing failed')
        setIsProcessing(false)
      }
    } catch (err: any) {
      const errorMessage = err.detail || 'Failed to get job status'
      setError(errorMessage)
      toast.error(errorMessage)
      setIsProcessing(false)
    }
  }, [])

  // Download file
  const downloadFile = useCallback(async (fileId: string): Promise<void> => {
    console.log('[useOCR] Downloading file:', fileId, 'with session:', sessionId)

    if (!fileId) {
      console.error('[useOCR] No file ID provided for download')
      toast.error('Unable to download: File ID is missing')
      return
    }

    try {
      console.log('[useOCR] Calling API to download file:', fileId)

      // Pass session_id to download endpoint
      const blob = await ocrApi.downloadFile(fileId, sessionId || undefined)

      console.log('[useOCR] Download successful, blob size:', blob.size)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `excel-result-${fileId}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('File downloaded successfully')
    } catch (err: any) {
      console.error('[useOCR] Download failed:', err)
      const errorMessage = err.detail || err.message || 'Failed to download file'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [sessionId])

  // Save to history
  const saveToHistory = useCallback(async (): Promise<void> => {
    if (!jobId || !files || files.length === 0) {
      toast.error('No job to save')
      return
    }

    setIsSaving(true)
    try {
      // First, try the backend endpoint
      try {
        const response = await ocrApi.saveToHistory(jobId)
        if (response.success) {
          setIsSaved(true)
          toast.success('Job saved to history!')
          return
        }
      } catch (backendErr) {
        console.log('[useOCR] Backend save failed, using direct Supabase save')
      }

      // Fallback: Save directly to Supabase
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Please sign in to save jobs')
        return
      }

      // Get the processing job to copy its data
      const { data: processingJob, error: fetchError } = await supabase
        .from('processing_jobs')
        .select('*')
        .eq('job_id', jobId)
        .single()

      if (fetchError || !processingJob) {
        console.error('[useOCR] Failed to fetch processing job:', fetchError)
        toast.error('Failed to find job data')
        return
      }

      // Type the metadata properly
      const metadata = processingJob.processing_metadata as Record<string, any> | null
      const storageFiles = metadata?.storage_files as Array<{ url?: string }> | undefined

      // Save to job_history table (create if not exists)
      const { error: saveError } = await supabase
        .from('job_history')
        .insert({
          original_job_id: jobId, // Changed from job_id to original_job_id
          user_id: user.id,
          filename: files[0]?.filename || `batch_${new Date().toISOString().split('T')[0]}.xlsx`,
          status: 'completed',
          result_url: storageFiles?.[0]?.url ||
                     (files[0]?.file_id ? `/api/v1/download/${files[0].file_id}` : null),
          processing_metadata: {
            ...(metadata || {}),
            total_images: files.length,
            files: files.map(f => ({
              file_id: f.file_id,
              filename: f.filename
            }))
          }
        })

      if (saveError) {
        // If table doesn't exist, show helpful error
        if (saveError.code === '42P01') {
          toast.error('History table not set up. Please contact support.')
          console.error('[useOCR] job_history table does not exist')
        } else {
          console.error('[useOCR] Supabase save error:', saveError)
          toast.error('Failed to save to history')
        }
        return
      }

      setIsSaved(true)
      toast.success('Job saved to history!')
    } catch (err: any) {
      const errorMessage = err.detail || err.message || 'Failed to save to history'
      console.error('[useOCR] Save error:', err)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }, [jobId, files])

  // Connect to WebSocket for real-time updates
  const connectWebSocket = useCallback((sessionId: string) => {
    // Disconnect any existing WebSocket first
    if (wsRef.current) {
      wsRef.current.disconnect()
      wsRef.current = null
    }

    // Start processing state immediately
    setIsProcessing(true)

    const websocket = new OCRWebSocket(
      sessionId,
      (data) => {
        // Handle WebSocket messages
        console.log('WebSocket message:', data)

        // Handle different message types from backend
        const messageType = data.type || ''

        // PROGRESSIVE RESULTS: Individual file ready for download
        if (messageType === 'file_ready') {
          console.log('[WebSocket] File ready:', data.file_info)
          
          // Validate file_info structure
          if (!data.file_info || !data.file_info.file_id) {
            console.error('[WebSocket] Invalid file_info structure:', data.file_info)
            return
          }
          
          // Add file to downloads list immediately as it becomes available
          setFiles(prev => {
            const existing = prev || []
            // Avoid duplicates by checking file_id
            if (existing.some(f => f.file_id === data.file_info.file_id)) {
              console.log('[WebSocket] Duplicate file_id, skipping:', data.file_info.file_id)
              return existing
            }
            console.log('[WebSocket] Adding new file to list:', data.file_info)
            return [...existing, data.file_info]
          })

          // Show toast for individual file completion
          toast.success(`File ${data.image_number}/${data.total_images} ready for download!`)
        }

        // Progress updates
        if (messageType === 'job_progress' || messageType === 'progress') {
          setStatus(data.status || 'processing')

          // Update progress with backend data
          if (data.total_images && data.processed_images !== undefined) {
            setProgress({
              total_images: data.total_images,
              processed_images: data.processed_images,
              percentage: data.progress || Math.round((data.processed_images / data.total_images) * 100)
            })
          }
        }

        // Job completed
        if (messageType === 'job_completed' || data.status === 'completed') {
          console.log('[WebSocket] Job completed:', data)
          
          setStatus('completed')
          setProgress({
            total_images: data.total_images || 0,
            processed_images: data.total_images || 0,
            percentage: 100
          })

          // Set download files
          if (data.files || data.download_urls) {
            const fileList = data.files || (data.download_urls || []).map((url: string, idx: number) => ({
              file_id: url.split('/').pop(),
              download_url: url,
              filename: `result-${idx + 1}.xlsx`
            }))
            
            console.log('[WebSocket] Setting completed files:', fileList)
            setFiles(fileList)
          } else {
            console.warn('[WebSocket] Job completed but no files data received')
          }

          // Only show completion toast once
          setHasShownCompletion(prev => {
            if (!prev) {
              toast.success(`Processing completed! ${data.successful_images || 0} files ready.`)
            }
            return true
          })
          setIsProcessing(false)
        }

        // Job failed
        if (messageType === 'job_error' || data.status === 'failed') {
          const errorMsg = data.error || data.errors?.[0] || 'Processing failed'
          setError(errorMsg)
          setStatus('failed')
          toast.error(errorMsg)
          setIsProcessing(false)
        }

        // System messages
        if (messageType === 'system') {
          console.log('System message:', data.message)
        }
      },
      (error) => {
        console.error('WebSocket error:', error)
        // Don't show error toast for normal disconnects
      }
    )

    websocket.connect()
    wsRef.current = websocket
  }, [])

  // Disconnect WebSocket
  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.log('[useOCR] Disconnecting WebSocket...')
      wsRef.current.disconnect()
      wsRef.current = null
    }
  }, [])

  // Reset state
  const reset = useCallback(() => {
    console.log('[useOCR] Resetting state...')
    setIsUploading(false)
    setIsProcessing(false)
    setUploadProgress(0)
    setJobId(null)
    setSessionId(null) // Clear session ID
    setStatus(null)
    setProgress(null)
    setFiles(null)
    setError(null)
    setIsSaved(false)
    setIsSaving(false)
    setHasShownCompletion(false)
    disconnectWebSocket()
  }, [disconnectWebSocket])

  // Cleanup on unmount - FIXED: stable dependency
  useEffect(() => {
    return () => {
      console.log('[useOCR] Component unmounting, cleaning up WebSocket...')
      if (wsRef.current) {
        wsRef.current.disconnect()
        wsRef.current = null
      }
    }
  }, []) // Empty dependency array - cleanup only runs on unmount

  return {
    isUploading,
    isProcessing,
    uploadProgress,
    jobId,
    status,
    progress,
    files,
    error,
    isSaved,
    isSaving,
    uploadImage,
    uploadBatch,
    getStatus,
    downloadFile,
    saveToHistory,
    connectWebSocket,
    disconnectWebSocket,
    reset,
  }
}

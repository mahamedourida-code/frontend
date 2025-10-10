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
        consolidation_strategy: 'separate'
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
    try {
      // Pass session_id to download endpoint
      const blob = await ocrApi.downloadFile(fileId, sessionId || undefined)

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ocr-result-${fileId}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('File downloaded successfully')
    } catch (err: any) {
      const errorMessage = err.detail || 'Failed to download file'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }, [sessionId])

  // Save to history
  const saveToHistory = useCallback(async (): Promise<void> => {
    if (!jobId) {
      toast.error('No job to save')
      return
    }

    setIsSaving(true)
    try {
      const response = await ocrApi.saveToHistory(jobId)
      if (response.success) {
        setIsSaved(true)
        toast.success('Job saved to history!')
      } else {
        toast.error('Failed to save to history')
      }
    } catch (err: any) {
      const errorMessage = err.detail || 'Failed to save to history'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }, [jobId])

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
          console.log('File ready:', data.file_info)
          // Add file to downloads list immediately as it becomes available
          setFiles(prev => {
            const existing = prev || []
            // Avoid duplicates by checking file_id
            if (existing.some(f => f.file_id === data.file_info.file_id)) {
              return existing
            }
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
            setFiles(fileList)
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

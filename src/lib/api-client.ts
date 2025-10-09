import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, signOut } from './supabase'

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      console.log('[API Client Interceptor] Request to:', config.url)
      // Get JWT token from Supabase session
      const token = await getAccessToken()

      if (token) {
        console.log('[API Client Interceptor] Token found, adding to Authorization header')
        // Add Authorization header if user is authenticated
        config.headers.Authorization = `Bearer ${token}`
      } else {
        console.log('[API Client Interceptor] No token found, proceeding without auth')
      }

      return config
    } catch (error) {
      console.error('[API Client Interceptor] Error getting access token:', error)
      return config
    }
  },
  (error) => {
    console.error('[API Client Interceptor] Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Client Interceptor] Response received:', response.status, response.statusText)
    return response
  },
  (error: AxiosError<any>) => {
    console.error('[API Client Interceptor] Response error:', error)
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      console.error('[API Client Interceptor] Server error response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      })

      const apiError = {
        detail: error.response.data?.message || error.response.data?.detail || 'An error occurred',
        status_code: error.response.status,
      }

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          console.error('[API Client Interceptor] Unauthorized - Session may have expired')
          // Try to sign out to clear invalid session
          signOut().then(() => {
            console.log('[API Client Interceptor] Signed out due to 401 error')
            // Optionally redirect to login page
            if (typeof window !== 'undefined') {
              window.location.href = '/sign-in'
            }
          }).catch((signOutError) => {
            console.error('[API Client Interceptor] Error signing out after 401:', signOutError)
          })
          break
        case 403:
          console.error('[API Client Interceptor] Forbidden - Insufficient permissions')
          break
        case 429:
          console.error('[API Client Interceptor] Rate limit exceeded')
          break
        case 500:
          console.error('[API Client Interceptor] Server error')
          break
      }

      return Promise.reject(apiError)
    } else if (error.request) {
      // Request made but no response received
      console.error('[API Client Interceptor] No response received:', error.request)
      const apiError = {
        detail: 'No response from server. Please check your connection.',
        status_code: 0,
      }
      return Promise.reject(apiError)
    } else {
      // Something else happened
      console.error('[API Client Interceptor] Request setup error:', error.message)
      const apiError = {
        detail: error.message || 'An unexpected error occurred',
        status_code: 0,
      }
      return Promise.reject(apiError)
    }
  }
)

// API Types matching backend
export interface ImageData {
  image: string // base64 encoded
  filename?: string
}

export interface BatchConvertRequest {
  images: ImageData[]
  output_format?: 'xlsx' | 'csv' | 'json'
  consolidation_strategy?: 'separate' | 'single_file' | 'single_sheet'
}

export interface BatchConvertResponse {
  success: boolean
  job_id: string
  estimated_completion: string
  status_url: string
  session_id: string
}

export interface JobProgress {
  total_images: number
  processed_images: number
  current_image?: string
  percentage: number
}

export interface ProcessedFile {
  file_id: string
  download_url: string
  filename: string
  original_image: string
  size_bytes?: number
  created_at: string
}

export interface BatchJobResults {
  total_images: number
  successful_images: number
  failed_images: number
  files: ProcessedFile[]
  total_files: number
  primary_download: string | null
  expires_at: string
  processing_time_seconds: number
  completed_at: string
}

export interface JobStatusResponse {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partially_completed'
  progress?: JobProgress
  results?: BatchJobResults
  errors: string[]
  created_at: string
  updated_at: string
}

// OCR API endpoints matching the actual backend
export const ocrApi = {
  /**
   * Upload and process multiple images in batch
   * This is the main endpoint for the backend
   */
  uploadBatch: async (images: ImageData[]): Promise<BatchConvertResponse> => {
    console.log('[API Client] uploadBatch called with', images.length, 'images')
    const request: BatchConvertRequest = {
      images,
      output_format: 'xlsx',
      consolidation_strategy: 'separate'
    }

    console.log('[API Client] Posting to', `${API_BASE_URL}/api/v1/jobs/batch`)
    const response = await apiClient.post<BatchConvertResponse>('/api/v1/jobs/batch', request)
    console.log('[API Client] Response received:', response.data)
    return response.data
  },

  /**
   * Upload a single image (wrapper around batch endpoint)
   */
  uploadImage: async (file: File): Promise<BatchConvertResponse> => {
    // Convert file to base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Remove data URL prefix to get just the base64 string
        const base64Data = result.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const imageData: ImageData = {
      image: base64,
      filename: file.name
    }

    return ocrApi.uploadBatch([imageData])
  },

  /**
   * Get processing status for a specific job
   */
  getStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const response = await apiClient.get<JobStatusResponse>(`/api/v1/jobs/${jobId}/status`)
    return response.data
  },

  /**
   * Download processed file
   */
  downloadFile: async (fileId: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/download/${fileId}`, {
      responseType: 'blob',
    })
    return response.data
  },

  /**
   * Cancel a running job
   */
  cancelJob: async (jobId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/jobs/${jobId}`)
  },

  /**
   * Get job history for authenticated user
   */
  getHistory: async (limit: number = 50, offset: number = 0): Promise<any> => {
    const response = await apiClient.get(`/api/v1/jobs/history`, {
      params: { limit, offset }
    })
    return response.data
  },

  /**
   * Save a completed job to user's permanent history
   */
  saveToHistory: async (jobId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(`/api/v1/jobs/${jobId}/save`)
    return response.data
  },
}

// WebSocket connection for real-time updates
export class OCRWebSocket {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second
  private shouldReconnect = true // Flag to control reconnection
  private isCompleted = false // Track if job is completed

  constructor(
    private sessionId: string,
    private onMessage: (data: any) => void,
    private onError?: (error: Event) => void
  ) {}

  async connect(): Promise<void> {
    try {
      const token = await getAccessToken()
      const wsUrl = token
        ? `${WS_BASE_URL}/api/v1/ws/session/${this.sessionId}?token=${token}`
        : `${WS_BASE_URL}/api/v1/ws/session/${this.sessionId}`

      this.ws = new WebSocket(wsUrl)

      this.ws.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.reconnectDelay = 1000
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          // Check if job is completed or failed - stop reconnecting
          if (data.type === 'job_completed' || data.status === 'completed' ||
              data.type === 'job_error' || data.status === 'failed') {
            this.isCompleted = true
            this.shouldReconnect = false
            console.log('Job finished, disabling reconnection')
          }

          this.onMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.onError?.(error)
      }

      this.ws.onclose = () => {
        console.log('WebSocket closed')
        // Only attempt reconnect if job is not completed
        if (this.shouldReconnect && !this.isCompleted) {
          this.attemptReconnect()
        } else {
          console.log('WebSocket closed - not reconnecting (job finished or manual disconnect)')
        }
      }
    } catch (error) {
      console.error('Error connecting to WebSocket:', error)
      throw error
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay)

      // Exponential backoff
      this.reconnectDelay *= 2
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect(): void {
    this.shouldReconnect = false // Prevent reconnection on manual disconnect
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    } else {
      console.error('WebSocket is not connected')
    }
  }
}

export default apiClient

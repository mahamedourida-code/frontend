import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { createClient } from '@/utils/supabase/client'

// Create Supabase client instance
const supabase = createClient()

// Check if we're on mobile
const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

/**
 * Get the current user's JWT access token from Supabase session
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      return null
    }

    if (!session) {
      return null
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = Math.floor(Date.now() / 1000)
    const expiresAt = session.expires_at || 0
    const timeUntilExpiry = expiresAt - now

    if (timeUntilExpiry < 300) { // Less than 5 minutes
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError || !refreshedSession) {
        return null
      }

      return refreshedSession.access_token
    }

    return session.access_token
  } catch (error) {
    return null
  }
}

/**
 * Sign out the current user
 */
async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  } catch (error) {
    throw error
  }
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-lively-hill-7043.fly.dev'
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://backend-lively-hill-7043.fly.dev'

// Create axios instance with mobile-optimized settings
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: isMobile ? 60000 : 30000, // 60 seconds for mobile, 30 for desktop
  headers: {
    'Content-Type': 'application/json',
  },
  // Add retry configuration
  maxRedirects: 5,
  validateStatus: (status) => status < 400,
})

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Only add auth token for API requests, not for auth-related endpoints
      const isAuthEndpoint = config.url?.includes('/auth/') || config.url?.includes('/sign')
      
      if (!isAuthEndpoint) {
        // Get JWT token from Supabase session
        const token = await getAccessToken()

        if (token) {
          // Add Authorization header if user is authenticated
          config.headers.Authorization = `Bearer ${token}`
        }
      }

      return config
    } catch (error) {
      return config
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add retry configuration for mobile
let retryCount = 0
const MAX_RETRIES = isMobile ? 3 : 1

// Response interceptor for error handling with mobile retry logic
apiClient.interceptors.response.use(
  (response) => {
    retryCount = 0 // Reset retry count on success
    return response
  },
  async (error: AxiosError<any>) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status

      const responseData = error.response.data || {}
      const apiError = {
        ...responseData,
        detail: responseData.message || responseData.detail || 'An error occurred',
        status_code: error.response.status,
      }

      // Handle specific status codes
      switch (error.response.status) {
        case 401:
          // Only sign out if we're not already on the sign-in page
          // This prevents infinite loops
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/sign-in')) {
            // Check if error is specifically about expired token
            const errorDetail = error.response.data?.detail || error.response.data?.message || ''
            if (errorDetail.toLowerCase().includes('expired') || errorDetail.toLowerCase().includes('invalid')) {
              signOut().then(() => {
                const next = `${window.location.pathname}${window.location.search}`
                window.location.href = `/sign-in?next=${encodeURIComponent(next)}`
              }).catch(() => undefined)
            }
          }
          break
        case 403:
          break
        case 429:
          break
        case 500:
          break
      }

      return Promise.reject(apiError)
    } else if (error.request) {
      // Request made but no response received - likely network error or cold start
      
      // Mobile retry logic for network/timeout errors
      if (isMobile && retryCount < MAX_RETRIES && error.config) {
        retryCount++
        
        // Exponential backoff: 1s, 2s, 4s
        const delay = Math.pow(2, retryCount - 1) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
        
        // Increase timeout for retry
        error.config.timeout = (error.config.timeout || 30000) * 1.5
        
        try {
          const response = await apiClient.request(error.config)
          retryCount = 0 // Reset on success
          return response
        } catch (retryError) {
          // Continue to next retry or fail
        }
      }
      
      const apiError = {
        detail: isMobile 
          ? 'Connection failed. The server might be starting up. Please try again in a moment.'
          : 'No response from server. Please check your connection.',
        status_code: 0,
      }
      return Promise.reject(apiError)
    } else {
      // Something else happened
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

export interface AppLimits {
  plan: 'anonymous' | 'free' | 'pro' | 'enterprise'
  max_files_per_batch: number
  absolute_max_files_per_batch: number
  max_file_size_mb: number
  max_file_size_bytes: number
  daily_image_limit: number
  accepted_file_types: string[]
  queue: {
    max_queued_jobs: number
    max_active_jobs: number
    queued_jobs: number | null
    active_jobs: number | null
    available: boolean
  }
  credits?: {
    total_credits: number
    used_credits: number
    available_credits: number
  } | null
}

export type BillingPlanKey = 'pro_monthly' | 'pro_yearly' | 'business_monthly'

export interface BillingCheckoutResponse {
  checkout_id?: string
  checkout_url: string
  plan_key: BillingPlanKey
  plan: 'pro' | 'enterprise'
  credits: number
}

export interface BillingSubscription {
  plan?: 'free' | 'pro' | 'enterprise'
  status?: string
  renews_at?: string | null
  ends_at?: string | null
  cancelled?: boolean
  customer_portal_url?: string | null
  metadata?: {
    plan_key?: BillingPlanKey
    [key: string]: unknown
  } | null
}

export interface BillingStatusResponse {
  plan: 'free' | 'pro' | 'enterprise'
  credits: {
    total_credits: number
    used_credits: number
    available_credits: number
  }
  subscription?: BillingSubscription | null
  customer?: {
    portal_url?: string | null
    provider_customer_id?: string
  } | null
}

export const billingApi = {
  createCheckout: async (planKey: BillingPlanKey): Promise<BillingCheckoutResponse> => {
    const response = await apiClient.post<BillingCheckoutResponse>('/api/v1/billing/lemon/checkout', {
      plan_key: planKey,
    })
    return response.data
  },

  getStatus: async (): Promise<BillingStatusResponse> => {
    const response = await apiClient.get<BillingStatusResponse>('/api/v1/billing/status')
    return response.data
  },

  getPortal: async (): Promise<{ url: string }> => {
    const response = await apiClient.get<{ url: string }>('/api/v1/billing/portal')
    return response.data
  },
}

// OCR API endpoints matching the actual backend
export const ocrApi = {
  getLimits: async (): Promise<AppLimits> => {
    const response = await apiClient.get<AppLimits>('/api/v1/config/limits')
    return response.data
  },

  /**
   * Upload and process multiple images in batch using multipart/form-data
   * This is the recommended method - faster and more efficient than base64
   */
  uploadBatchMultipart: async (files: File[], options?: { output_format?: string; consolidation_strategy?: string }): Promise<BatchConvertResponse> => {

    // Create FormData object
    const formData = new FormData()

    // Append each file
    files.forEach(file => {
      formData.append('files', file)
    })

    // Append options
    formData.append('output_format', options?.output_format || 'xlsx')
    formData.append('consolidation_strategy', options?.consolidation_strategy || 'consolidated')


    // IMPORTANT: Override the default 'application/json' Content-Type
    // Let browser automatically set 'multipart/form-data' with boundary
    const response = await apiClient.post<BatchConvertResponse>('/api/v1/jobs/batch-upload', formData, {
      headers: {
        'Content-Type': undefined  // Let browser set multipart/form-data with boundary
      }
    })
    return response.data
  },

  /**
   * Upload and process multiple images in batch (legacy base64 method)
   * This is the old endpoint for the backend - use uploadBatchMultipart instead
   * @deprecated Use uploadBatchMultipart for better performance
   */
  uploadBatch: async (images: ImageData[]): Promise<BatchConvertResponse> => {
    const request: BatchConvertRequest = {
      images,
      output_format: 'xlsx',
      consolidation_strategy: 'separate'
    }

    const response = await apiClient.post<BatchConvertResponse>('/api/v1/jobs/batch', request)
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
   * Download processed file from local storage
   * @param fileId - File ID or Job ID to download
   * @param sessionId - Optional session ID for session-based file lookup
   */
  downloadFile: async (fileId: string, sessionId?: string): Promise<Blob> => {
    const params = sessionId ? { session_id: sessionId } : {}
    const response = await apiClient.get(`/api/v1/download/${fileId}`, {
      responseType: 'blob',
      params,
    })
    return response.data
  },

  /**
   * Download file from Supabase Storage
   * @param storagePath - Path to file in storage (e.g., "user_id/job_id/filename.xlsx")
   */
  downloadFromStorage: async (storagePath: string): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/download/storage/${storagePath}`, {
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
   * Get user's credit information
   */
  getUserCredits: async (): Promise<{ total_credits: number; used_credits: number; available_credits: number }> => {
    const response = await apiClient.get(`/api/v1/jobs/credits`)
    return response.data
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
   * Get saved job history for authenticated user
   * This fetches only explicitly saved jobs through the backend API
   */
  getSavedHistory: async (limit: number = 50, offset: number = 0): Promise<any> => {
    const response = await apiClient.get(`/api/v1/jobs/saved-history`, {
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

  /**
   * Delete a specific job from saved history
   */
  deleteFromHistory: async (jobId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/api/v1/jobs/saved-history/${jobId}`)
    return response.data
  },

  /**
   * Delete all jobs from saved history
   */
  deleteAllFromHistory: async (): Promise<{ success: boolean; message: string; deleted_count: number }> => {
    const response = await apiClient.delete(`/api/v1/jobs/saved-history/all`)
    return response.data
  },

  /**
   * Create a share session for batch files
   * @param data - Session creation parameters
   */
  createShareSession: async (data: {
    file_ids: string[]
    title?: string
    description?: string
    expires_in_days?: number
  }): Promise<{
    session_id: string
    share_url: string
    expires_at?: string
  }> => {
    const response = await apiClient.post('/api/v1/sessions/create', data)
    return response.data
  },

  /**
   * Get share session details
   * @param sessionId - Session ID
   */
  getSessionDetails: async (sessionId: string): Promise<{
    session_id: string
    title?: string
    description?: string
    files: Array<{
      file_id: string
      filename: string
      size_bytes?: number
      created_at?: string
    }>
    created_at: string
    expires_at?: string
    access_count: number
    is_active?: boolean
  }> => {
    const response = await apiClient.get(`/api/v1/sessions/${sessionId}`)
    return response.data
  },

  /**
   * Deactivate a share session
   * @param sessionId - Session ID to deactivate
   */
  deactivateShareSession: async (sessionId: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/v1/sessions/${sessionId}`)
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
          }

          this.onMessage(data)
        } catch {
          return
        }
      }

      this.ws.onerror = (error) => {
        this.onError?.(error)
      }

      this.ws.onclose = () => {
        // Only attempt reconnect if job is not completed
        if (this.shouldReconnect && !this.isCompleted) {
          this.attemptReconnect()
        }
      }
    } catch (error) {
      throw error
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++

      setTimeout(() => {
        this.connect()
      }, this.reconnectDelay)

      // Exponential backoff
      this.reconnectDelay *= 2
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
    }
  }
}

export default apiClient

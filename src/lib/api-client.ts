import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { AxiosProgressEvent } from 'axios'
import { createClient } from '@/utils/supabase/client'
import { publicConfig } from '@/lib/public-config'
import { getOrCreateTrialUUID } from '@/lib/free-trial'

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

function getAnonymousSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return getOrCreateTrialUUID() || null
}

// API configuration
// Create axios instance with mobile-optimized settings
const apiClient: AxiosInstance = axios.create({
  baseURL: publicConfig.apiUrl,
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
        } else {
          const anonymousSessionId = getAnonymousSessionId()
          if (anonymousSessionId) {
            config.headers['X-Session-Id'] = anonymousSessionId
          }
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
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject({
        code: 'ERR_CANCELED',
        name: 'CanceledError',
        detail: 'Request cancelled',
        status_code: 0,
      })
    }

    // Handle common errors
    if (error.response) {
      // Server responded with error status

      const responseData = error.response.data || {}
      const detailPayload = responseData.detail && typeof responseData.detail === 'object'
        ? responseData.detail
        : {}
      const detailMessage =
        responseData.message ||
        detailPayload.message ||
        (typeof responseData.detail === 'string' ? responseData.detail : null) ||
        'An error occurred'
      const apiError = {
        ...responseData,
        ...detailPayload,
        detail: detailMessage,
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

export type DocumentMode = 'auto' | 'table' | 'invoice' | 'receipt' | 'bank_statement' | 'notes' | 'invoice_receipt'
export type ResolvedDocumentMode = 'table' | 'invoice' | 'receipt' | 'bank_statement' | 'notes'
export type DetectedDocumentMode = ResolvedDocumentMode | 'needs_manual_selection'

export interface BatchConvertRequest {
  images: ImageData[]
  output_format?: 'xlsx' | 'csv' | 'txt'
  consolidation_strategy?: 'separate' | 'single_file' | 'single_sheet'
  document_mode?: DocumentMode
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
  document_id?: string
  source_page?: number | null
  source_page_count?: number | null
  source_filename?: string
  input_preview_url?: string
  size_bytes?: number
  status?: string
  document_mode?: DocumentMode
  requires_review?: boolean
  confidence_score?: number
  is_handwritten?: boolean
  row_confidence?: number[]
  review_flags?: Array<Record<string, unknown>>
  created_at: string
}

export interface JobDocumentExtraction {
  id?: string
  document_id: string
  processing_unit_id: string
  result_file_id?: string | null
  status: string
  source_preview_url?: string | null
  source_page?: number | null
  source_page_count?: number | null
  source_filename?: string | null
  metadata?: Record<string, unknown>
  review_status?: string
  validation_flags?: Array<Record<string, unknown>>
  raw_structured_data?: Record<string, unknown>
  reviewed_data?: Record<string, unknown>
  edited?: boolean
}

export interface DocumentDuplicateWarning {
  id: string
  type: 'exact_source' | 'accounting_key' | 'statement_fingerprint'
  code: string
  message: string
  matched_document_id?: string
  matched_job_id?: string
  matched_filename?: string
  matched_created_at?: string
  fields?: Record<string, unknown>
  overridden?: boolean
  detected_at?: string
  overridden_at?: string
}

export interface VendorRuleFields {
  category_account?: string
  vendor_ref_id?: string
  account_ref_id?: string
  tax_code?: string
  tax_code_ref_id?: string
  currency?: string
  payment_terms?: string
  destination_treatment?: string
}

export type VendorRuleAutoMode = 'suggest' | 'auto_fill' | 'auto_ready'

export interface VendorRule {
  id: string
  owner_user_id: string
  workspace_id: string
  vendor_key: string
  display_name: string
  applies_to: 'invoice' | 'receipt' | 'both'
  suggested_fields: VendorRuleFields
  enabled: boolean
  /**
   * How the rule is applied to new documents from this vendor.
   * - suggest:    legacy behaviour, surfaces the rule as a suggestion only
   * - auto_fill:  pre-fills the AP draft on creation, user still confirms
   * - auto_ready: pre-fills and moves the item straight to Ready to publish
   */
  auto_mode?: VendorRuleAutoMode
  source_document_id?: string | null
  approved_at: string
  updated_at: string
}

export type AccountsPayableStatus =
  | 'needs_coding'
  | 'needs_review'
  | 'ready_to_publish'
  | 'published'
  | 'failed'
  | 'discarded'

export interface AccountsPayableDuplicateWarning {
  id: string
  type: 'vendor_amount_date'
  code: string
  message: string
  matched_item_id?: string
  matched_document_id?: string
  matched_job_id?: string
  matched_status?: AccountsPayableStatus
  matched_filename?: string
  matched_created_at?: string
  fields?: { vendor?: string; amount?: string; date?: string } | Record<string, unknown>
  dismissed?: boolean
  detected_at?: string
}

export interface AccountsPayableDraftData {
  vendor?: string
  vendor_ref_id?: string
  invoice_number?: string
  invoice_date?: string
  due_date?: string
  reference?: string
  account_category?: string
  account_ref_id?: string
  tax_code?: string
  tax_code_ref_id?: string
  currency?: string
  subtotal?: unknown
  tax_amount?: unknown
  total?: unknown
  line_items?: Array<Record<string, unknown>>
}

export interface QuickBooksBillPublication {
  id: string
  status: 'publishing' | 'published' | 'failed' | 'indeterminate'
  attempt_count: number
  quickbooks_bill_id?: string | null
  quickbooks_attachment_id?: string | null
  attachment_status?: 'pending' | 'attached' | 'failed' | 'not_requested' | null
  failure_details?: Array<{ stage?: string; message?: string; at?: string }>
  attempted_at?: string | null
  published_at?: string | null
  updated_at?: string | null
}

export interface XeroBillPublication {
  id: string
  status: 'publishing' | 'published' | 'failed' | 'indeterminate'
  xero_invoice_id?: string | null
  attachment_status?: 'pending' | 'attached' | 'failed' | 'not_requested' | null
  failure_details?: Array<{ stage?: string; message?: string; at?: string }>
  attempted_at?: string | null
  published_at?: string | null
  updated_at?: string | null
}

export type ReceiptPublishingDestination = 'expense' | 'bill'

export interface ReceiptQuickBooksPublishRequest {
  destination: ReceiptPublishingDestination
  vendor_ref_id?: string
  account_ref_id: string
  tax_code_ref_id?: string
  payment_account_ref_id?: string
  payment_type?: 'Cash' | 'Check' | 'CreditCard'
}

export interface QuickBooksReceiptPublication {
  id: string
  destination: ReceiptPublishingDestination
  remote_entity_type: 'Purchase' | 'Bill'
  status: 'publishing' | 'published' | 'failed' | 'indeterminate'
  attempt_count: number
  quickbooks_remote_id?: string | null
  quickbooks_attachment_id?: string | null
  attachment_status?: 'pending' | 'attached' | 'failed' | null
  failure_details?: Array<{ stage?: string; message?: string; at?: string }>
  attempted_at?: string | null
  published_at?: string | null
  updated_at?: string | null
}

export interface PurchaseOrder {
  id: string
  po_number: string
  po_date?: string | null
  total: number
  remaining_amount?: number | null
  currency?: string | null
  status: 'open' | 'closed'
  vendor_name?: string | null
  vendor_key?: string | null
  over_by?: string | null
}

export type PurchaseOrderMatchStatus = 'matched' | 'exceeds' | 'unmatched'

export interface AccountsPayableItem {
  id: string
  owner_user_id: string
  workspace_id: string
  company_id?: string | null
  document_id: string
  job_id: string
  status: AccountsPayableStatus
  draft_data: AccountsPayableDraftData
  attachment_visible: boolean
  source_filename: string
  source_content_type?: string | null
  source_access_url?: string | null
  document_review_status?: string | null
  vendor_suggestion?: VendorRule | null
  metadata?: Record<string, unknown>
  duplicate_warnings?: AccountsPayableDuplicateWarning[]
  matched_po_id?: string | null
  matched_po?: PurchaseOrder | null
  po_match_status?: PurchaseOrderMatchStatus
  created_at: string
  updated_at: string
  published_at?: string | null
  quickbooks_publication?: QuickBooksBillPublication | null
  xero_publication?: XeroBillPublication | null
}

export interface QuickBooksConnectionStatus {
  connected: boolean
  status: 'connected' | 'disconnected' | 'error'
  workspace_id?: string | null
  realm_id?: string | null
  company_name?: string | null
  connected_at?: string | null
  last_synced_at?: string | null
  reference_counts: Partial<Record<'vendor' | 'account' | 'tax_code', number>>
}

export interface QuickBooksReferenceItem {
  resource_type: 'vendor' | 'account' | 'tax_code'
  external_id: string
  display_name: string
  active: boolean
  details?: Record<string, unknown>
  synced_at: string
}

export type AccountingConnectionStatus = QuickBooksConnectionStatus
export type AccountingReferenceItem = QuickBooksReferenceItem

export interface JobDocumentRecord {
  id: string
  job_id: string
  company_id?: string | null
  original_filename: string
  source_content_type?: string | null
  selected_mode: DocumentMode
  detected_mode?: DetectedDocumentMode | null
  resolved_mode?: ResolvedDocumentMode | null
  detection_confidence?: number | null
  detection_review_reason?: string | null
  mode_override_history?: Array<Record<string, unknown>>
  metadata?: Record<string, unknown>
  duplicate_warnings?: DocumentDuplicateWarning[]
  vendor_suggestion?: VendorRule | null
  quickbooks_receipt_publication?: QuickBooksReceiptPublication | null
  status: string
  review_status?: 'needs_review' | 'ready' | 'edited' | 'failed' | 'published' | 'deleted'
  source_access_url?: string | null
  preview_expires_in?: number
  extractions: JobDocumentExtraction[]
  result_files: ProcessedFile[]
}

export interface JobDocumentsResponse {
  job_id: string
  status: string
  documents: JobDocumentRecord[]
  total: number
}

export type ConnectedSourceProvider = 'google_drive' | 'dropbox'

export type DocumentSourceKind = 'direct_upload' | 'email' | 'client_link' | 'google_drive' | 'dropbox'

export interface ConnectedSource {
  id: string
  workspace_id: string
  provider: ConnectedSourceProvider
  status: 'pending' | 'connected' | 'error' | 'disconnected'
  display_label?: string | null
  watched_folder?: string | null
  watched_folder_id?: string | null
  account_email?: string | null
  last_synced_at?: string | null
  last_sync_status?: string | null
  last_sync_error?: string | null
  created_at: string
  updated_at: string
}

export interface ConnectedSourcesListResponse {
  sources: ConnectedSource[]
  total: number
  providers_configured: Record<ConnectedSourceProvider, boolean>
}

export interface EmailIntakeAddress {
  id: string
  workspace_id: string
  address: string
  enabled: boolean
  provider: 'resend'
}

export interface EmailIntakeMessage {
  id: string
  sender: string
  received_at: string
  source_email_reference: string
  status: 'received' | 'queued' | 'rejected' | 'failed'
  job_id?: string | null
  job_status?: string | null
  attachment_count: number
  accepted_attachment_count: number
  rejected_attachments: Array<{ filename: string; reason: string }>
  documents: Array<{
    id: string
    original_filename: string
    status: string
    review_status?: DocumentReviewStatus
  }>
}

export interface WorkspaceRecord {
  id: string
  owner_user_id: string
  name: string
  role: 'owner' | 'reviewer'
  created_at: string
  updated_at: string
}

export interface CompanyDocumentCounts {
  purchases: number
  receipts: number
  bank_statements: number
  other: number
  needs_review: number
}

export interface CompanySummary {
  id: string
  workspace_id: string
  name: string
  is_default: boolean
  document_counts: CompanyDocumentCounts
  bills: number
  last_upload_at?: string | null
  quickbooks_connected: boolean
  quickbooks_company_name?: string | null
  accounting_destination?: AccountingDestination
  accounting_connected?: boolean
  accounting_company_name?: string | null
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  member_email: string
  role: 'owner' | 'reviewer'
  status: 'pending' | 'active' | 'revoked'
  created_at: string
  updated_at: string
}

export interface ClientUploadLink {
  id: string
  workspace_id: string
  label: string
  expires_at: string
  max_submissions: number
  submission_count: number
  enabled: boolean
  revoked_at?: string | null
  created_at: string
}

export interface ClientAnalyticsRow {
  link_id: string
  name: string
  documents_this_month: number
  total_documents: number
  success_rate: number | null
  avg_turnaround_hours: number | null
  last_submission_at: string | null
  days_since_last: number | null
  is_late: boolean
  never_submitted: boolean
  enabled: boolean
  job_ids: string[]
}

export interface ClientUploadSubmission {
  id: string
  workspace_id: string
  status: 'received' | 'queued' | 'rejected' | 'failed'
  job_id?: string | null
  job_status?: string | null
  file_count: number
  created_at: string
  documents: Array<{
    id: string
    original_filename: string
    status: string
    review_status?: DocumentReviewStatus
  }>
}

export type ClientStatusStage = 'received' | 'processing' | 'reviewed' | 'done'

export interface ClientStatusView {
  label: string
  workspace_name: string
  submissions: Array<{
    id: string
    submitted_at: string
    file_count: number
    documents: Array<{ filename: string; stage: ClientStatusStage }>
  }>
}

export type DocumentReviewStatus = 'needs_review' | 'ready' | 'edited' | 'failed' | 'published' | 'deleted'

export interface DocumentReviewChange {
  id?: string
  document_id: string
  extraction_id: string
  job_id: string
  field_path: Array<string | number>
  previous_value: unknown
  changed_value: unknown
  created_at: string
}

export interface DocumentReviewResponse {
  job_id: string
  document: JobDocumentRecord & { changes?: DocumentReviewChange[] }
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

export interface RecoverableJobSummary {
  job_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'partially_completed' | string
  session_id?: string
  created_at?: string
  updated_at?: string
  total_images?: number
  processed_images?: number
  percentage?: number
  active?: boolean
}

export interface JobRecoveryResponse {
  job: RecoverableJobSummary | null
  active: boolean
  jobs: RecoverableJobSummary[]
}

export type DashboardRange = '1d' | '7d' | '30d' | '3m'

export interface DashboardSummaryResponse {
  range: DashboardRange
  chart: Array<{
    timestamp: string
    count: number
    formattedDate?: string
    formattedTime?: string
  }>
  stats: {
    totalProcessed: number
    todayProcessed: number
    thisMonthProcessed: number
    monthProcessed: number
    lastWeekProcessed: number
    selectedPeriodProcessed: number
    averageTime: number
    successRate: number
    totalJobs: number
    activeJobs: number
    failedJobs: number
    successfulJobs: number
  }
}

export interface UploadBatchMultipartOptions {
  output_format?: string
  consolidation_strategy?: string
  document_mode?: DocumentMode
  workspace_id?: string
  company_id?: string
  signal?: AbortSignal
  onUploadProgress?: (percent: number, event: AxiosProgressEvent) => void
}

export interface AppLimits {
  plan: 'anonymous' | 'free' | 'pro' | 'max' | 'mega'
  max_files_per_batch: number
  absolute_max_files_per_batch: number
  max_file_size_mb: number
  max_file_size_bytes: number
  daily_image_limit: number
  daily_run_limit?: number | null
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

export type BillingPlanKey = 'pro_monthly' | 'pro_yearly' | 'max_monthly' | 'max_yearly' | 'mega_monthly' | 'mega_yearly'

export interface BillingPlan {
  key: 'free' | BillingPlanKey
  checkout_key?: BillingPlanKey | null
  name: string
  plan: 'anonymous' | 'free' | 'pro' | 'max' | 'mega'
  interval: 'forever' | 'month' | 'year'
  price_cents: number
  price_formatted: string
  currency: string
  credits: number
  included_volume: string
  max_files_per_batch: number
  daily_image_limit: number
  daily_run_limit?: number | null
  max_file_size_mb: number
  annual_discount_percent: number
  checkout_available: boolean
}

export interface BillingPlansResponse {
  provider: 'lemonsqueezy'
  currency: string
  plans: BillingPlan[]
}

export interface BillingCheckoutResponse {
  checkout_id?: string
  checkout_url: string
  plan_key: BillingPlanKey
  plan: 'pro' | 'max' | 'mega'
  credits: number
}

export interface BillingSubscription {
  plan?: 'free' | 'pro' | 'max' | 'mega' | 'business' | 'enterprise'
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
  plan: 'free' | 'pro' | 'max' | 'mega' | 'business' | 'enterprise'
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
  getPlans: async (): Promise<BillingPlansResponse> => {
    const response = await apiClient.get<BillingPlansResponse>('/api/v1/billing/plans')
    return response.data
  },

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

  getDashboard: async (range: DashboardRange = '7d'): Promise<DashboardSummaryResponse> => {
    const response = await apiClient.get<DashboardSummaryResponse>('/api/v1/jobs/dashboard', {
      params: { range },
    })
    return response.data
  },

  /**
   * Upload and process multiple images in batch using multipart/form-data
   * This is the recommended method - faster and more efficient than base64
   */
  uploadBatchMultipart: async (files: File[], options?: UploadBatchMultipartOptions): Promise<BatchConvertResponse> => {

    // Create FormData object
    const formData = new FormData()

    // Append each file
    files.forEach(file => {
      formData.append('files', file)
    })

    // Append options
    formData.append('output_format', options?.output_format || 'xlsx')
    formData.append('consolidation_strategy', options?.consolidation_strategy || 'consolidated')
    formData.append('document_mode', options?.document_mode || 'table')
    if (options?.workspace_id) formData.append('workspace_id', options.workspace_id)
    if (options?.company_id) formData.append('company_id', options.company_id)


    // IMPORTANT: Override the default 'application/json' Content-Type
    // Let browser automatically set 'multipart/form-data' with boundary
    const response = await apiClient.post<BatchConvertResponse>('/api/v1/jobs/batch-upload', formData, {
      headers: {
        'Content-Type': undefined  // Let browser set multipart/form-data with boundary
      },
      signal: options?.signal,
      timeout: isMobile ? 120000 : 90000,
      onUploadProgress: (event) => {
        if (!options?.onUploadProgress) return
        const percent = typeof event.progress === 'number'
          ? Math.round(event.progress * 100)
          : event.total
            ? Math.round((event.loaded * 100) / event.total)
            : 0
        options.onUploadProgress(Math.min(100, Math.max(0, percent)), event)
      },
    })
    return response.data
  },

  /**
   * Upload and process multiple images in batch (legacy base64 method)
   * This is the old endpoint for the backend - use uploadBatchMultipart instead
   * @deprecated Use uploadBatchMultipart for better performance
   */
  uploadBatch: async (images: ImageData[], documentMode: DocumentMode = 'table'): Promise<BatchConvertResponse> => {
    const request: BatchConvertRequest = {
      images,
      output_format: 'xlsx',
      consolidation_strategy: 'separate',
      document_mode: documentMode,
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

  getJobDocuments: async (jobId: string): Promise<JobDocumentsResponse> => {
    const response = await apiClient.get<JobDocumentsResponse>(`/api/v1/jobs/${jobId}/documents`)
    return response.data
  },

  overrideJobDocumentMode: async (
    jobId: string,
    documentId: string,
    documentMode: ResolvedDocumentMode,
    outputFormat: 'xlsx' | 'csv' | 'txt' = 'xlsx',
  ): Promise<{ job_id: string; document_id: string; status: string; resolved_mode: ResolvedDocumentMode }> => {
    const response = await apiClient.post(`/api/v1/jobs/${jobId}/documents/${documentId}/override-mode`, {
      document_mode: documentMode,
      output_format: outputFormat,
    })
    return response.data
  },

  getDocumentReview: async (jobId: string, documentId: string): Promise<DocumentReviewResponse> => {
    const response = await apiClient.get<DocumentReviewResponse>(`/api/v1/jobs/${jobId}/documents/${documentId}/review`)
    return response.data
  },

  updateDocumentReviewValue: async (
    jobId: string,
    documentId: string,
    data: {
      processing_unit_id: string
      field_path: Array<string | number>
      value: unknown
      base_review_grid?: unknown[][]
    },
  ): Promise<Record<string, unknown>> => {
    const response = await apiClient.post(`/api/v1/jobs/${jobId}/documents/${documentId}/review/changes`, data)
    return response.data
  },

  updateDocumentReviewStatus: async (
    jobId: string,
    documentId: string,
    reviewStatus: DocumentReviewStatus,
    reason?: string,
  ): Promise<DocumentReviewResponse> => {
    const response = await apiClient.post<DocumentReviewResponse>(`/api/v1/jobs/${jobId}/documents/${documentId}/review/status`, {
      review_status: reviewStatus,
      reason,
    })
    return response.data
  },

  overrideDocumentDuplicateWarning: async (
    jobId: string,
    documentId: string,
    warningId: string,
    reason?: string,
  ): Promise<DocumentReviewResponse> => {
    const response = await apiClient.post<DocumentReviewResponse>(`/api/v1/jobs/${jobId}/documents/${documentId}/duplicates/override`, {
      warning_id: warningId,
      reason,
    })
    return response.data
  },

  saveDocumentVendorRule: async (
    jobId: string,
    documentId: string,
    suggestedFields: VendorRuleFields,
  ): Promise<DocumentReviewResponse & { rule: VendorRule }> => {
    const response = await apiClient.post<DocumentReviewResponse & { rule: VendorRule }>(`/api/v1/jobs/${jobId}/documents/${documentId}/vendor-rule`, {
      suggested_fields: suggestedFields,
    })
    return response.data
  },

  publishReceiptToQuickBooks: async (
    jobId: string,
    documentId: string,
    request: ReceiptQuickBooksPublishRequest,
  ): Promise<DocumentReviewResponse> => {
    const response = await apiClient.post<DocumentReviewResponse>(
      `/api/v1/jobs/${jobId}/documents/${documentId}/quickbooks/receipt/publish`,
      request,
    )
    return response.data
  },

  downloadReviewedDocument: async (
    jobId: string,
    documentId: string,
    exportFormat: 'xlsx' | 'csv' | 'txt' = 'xlsx',
  ): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/jobs/${jobId}/documents/${documentId}/export`, {
      params: { format: exportFormat },
      responseType: 'blob',
    })
    return response.data
  },

  downloadReviewedBatch: async (
    jobId: string,
    exportFormat: 'xlsx' | 'csv' | 'txt' = 'xlsx',
  ): Promise<Blob> => {
    const response = await apiClient.get(`/api/v1/jobs/${jobId}/exports/reviewed`, {
      params: { format: exportFormat },
      responseType: 'blob',
    })
    return response.data
  },

  deleteStoredDocument: async (
    jobId: string,
    documentId: string,
  ): Promise<{ document_id: string; deleted: boolean; remaining_documents: number }> => {
    const response = await apiClient.delete(`/api/v1/jobs/${jobId}/documents/${documentId}`)
    return response.data
  },

  deleteStoredBatch: async (
    jobId: string,
  ): Promise<{ job_id: string; deleted: boolean; deleted_documents: number }> => {
    const response = await apiClient.delete(`/api/v1/jobs/${jobId}/documents`)
    return response.data
  },

  getLatestRecoverableJob: async (): Promise<JobRecoveryResponse> => {
    const response = await apiClient.get<JobRecoveryResponse>('/api/v1/jobs/recover/latest')
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
      download_url?: string
      office_viewer_url?: string
    }>
    created_at: string
    expires_at?: string
    access_count: number
    is_active?: boolean
    download_all_url?: string
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

export const vendorMemoryApi = {
  list: async (workspaceId?: string): Promise<{ rules: VendorRule[]; total: number }> => {
    const response = await apiClient.get<{ rules: VendorRule[]; total: number }>('/api/v1/vendor-rules', {
      params: workspaceId ? { workspace_id: workspaceId } : undefined,
    })
    return response.data
  },

  update: async (
    ruleId: string,
    updates: {
      display_name?: string
      suggested_fields?: VendorRuleFields
      enabled?: boolean
      auto_mode?: VendorRuleAutoMode
    },
  ): Promise<{ rule: VendorRule }> => {
    const response = await apiClient.patch<{ rule: VendorRule }>(`/api/v1/vendor-rules/${ruleId}`, updates)
    return response.data
  },

  delete: async (ruleId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/vendor-rules/${ruleId}`)
  },
}

export const accountsPayableApi = {
  list: async (
    status?: AccountsPayableStatus,
    options?: { duplicatesOnly?: boolean; companyId?: string },
  ): Promise<{ items: AccountsPayableItem[]; total: number }> => {
    const params: Record<string, string | boolean> = {}
    if (status) params.status = status
    if (options?.duplicatesOnly) params.duplicates_only = true
    if (options?.companyId) params.company_id = options.companyId
    const response = await apiClient.get<{ items: AccountsPayableItem[]; total: number }>('/api/v1/accounts-payable', {
      params: Object.keys(params).length ? params : undefined,
    })
    return response.data
  },

  createFromDocument: async (jobId: string, documentId: string): Promise<{ item: AccountsPayableItem }> => {
    const response = await apiClient.post<{ item: AccountsPayableItem }>('/api/v1/accounts-payable/from-document', {
      job_id: jobId,
      document_id: documentId,
    })
    return response.data
  },

  update: async (
    itemId: string,
    updates: {
      draft_data?: Pick<AccountsPayableDraftData, 'vendor' | 'vendor_ref_id' | 'invoice_number' | 'invoice_date' | 'due_date' | 'account_category' | 'account_ref_id' | 'tax_code' | 'tax_code_ref_id' | 'reference' | 'currency' | 'line_items'>
      attachment_visible?: boolean
      status?: AccountsPayableStatus
      reason?: string
      acknowledge_auto_applied?: boolean
    },
  ): Promise<{ item: AccountsPayableItem }> => {
    const response = await apiClient.patch<{ item: AccountsPayableItem }>(`/api/v1/accounts-payable/${itemId}`, updates)
    return response.data
  },

  publish: async (itemId: string): Promise<{ item: AccountsPayableItem }> => {
    const response = await apiClient.post<{ item: AccountsPayableItem }>(`/api/v1/accounts-payable/${itemId}/publish`)
    return response.data
  },

  dismissDuplicate: async (
    itemId: string,
    warningId: string,
    reason?: string,
  ): Promise<{ item: AccountsPayableItem }> => {
    const response = await apiClient.post<{ item: AccountsPayableItem }>(
      `/api/v1/accounts-payable/${itemId}/duplicate/dismiss`,
      { warning_id: warningId, reason },
    )
    return response.data
  },

  discard: async (itemId: string, reason?: string): Promise<{ item: AccountsPayableItem }> => {
    const response = await apiClient.post<{ item: AccountsPayableItem }>(
      `/api/v1/accounts-payable/${itemId}/discard`,
      { reason },
    )
    return response.data
  },

  listPurchaseOrders: async (vendor?: string): Promise<{ purchase_orders: PurchaseOrder[]; total: number }> => {
    const response = await apiClient.get<{ purchase_orders: PurchaseOrder[]; total: number }>(
      '/api/v1/accounts-payable/purchase-orders',
      { params: vendor ? { vendor } : undefined },
    )
    return response.data
  },

  importPurchaseOrders: async (csvText: string, workspaceId?: string): Promise<{ imported: number }> => {
    const response = await apiClient.post<{ imported: number }>(
      '/api/v1/accounts-payable/purchase-orders/import',
      { csv_text: csvText, workspace_id: workspaceId },
    )
    return response.data
  },

  matchPurchaseOrder: async (itemId: string, poId: string | null): Promise<{ item: AccountsPayableItem }> => {
    const response = await apiClient.post<{ item: AccountsPayableItem }>(
      `/api/v1/accounts-payable/${itemId}/match-po`,
      { po_id: poId },
    )
    return response.data
  },

  bulkPublish: async (itemIds: string[]): Promise<{ items: AccountsPayableItem[]; failures: Array<{ item_id: string; detail: string }>; total: number }> => {
    const response = await apiClient.post<{ items: AccountsPayableItem[]; failures: Array<{ item_id: string; detail: string }>; total: number }>('/api/v1/accounts-payable/publish', {
      item_ids: itemIds,
    })
    return response.data
  },
}

export const quickBooksApi = {
  status: async (workspaceId?: string): Promise<QuickBooksConnectionStatus> => {
    const response = await apiClient.get<QuickBooksConnectionStatus>('/api/v1/integrations/quickbooks/status', {
      params: workspaceId ? { workspace_id: workspaceId } : undefined,
    })
    return response.data
  },

  connect: async (workspaceId?: string): Promise<{ authorization_url: string }> => {
    const response = await apiClient.post<{ authorization_url: string }>('/api/v1/integrations/quickbooks/connect', {
      workspace_id: workspaceId,
    })
    return response.data
  },

  sync: async (workspaceId?: string): Promise<QuickBooksConnectionStatus> => {
    const response = await apiClient.post<QuickBooksConnectionStatus>('/api/v1/integrations/quickbooks/sync', {
      workspace_id: workspaceId,
    })
    return response.data
  },

  references: async (resourceType?: QuickBooksReferenceItem['resource_type'], workspaceId?: string): Promise<{ items: QuickBooksReferenceItem[]; total: number }> => {
    const response = await apiClient.get<{ items: QuickBooksReferenceItem[]; total: number }>('/api/v1/integrations/quickbooks/reference-data', {
      params: {
        ...(resourceType ? { resource_type: resourceType } : {}),
        ...(workspaceId ? { workspace_id: workspaceId } : {}),
      },
    })
    return response.data
  },

  disconnect: async (workspaceId?: string): Promise<QuickBooksConnectionStatus> => {
    const response = await apiClient.delete<QuickBooksConnectionStatus>('/api/v1/integrations/quickbooks', {
      params: workspaceId ? { workspace_id: workspaceId } : undefined,
    })
    return response.data
  },
}

export type AccountingDestination = 'quickbooks' | 'xero'

export const xeroApi = {
  status: async (workspaceId?: string): Promise<QuickBooksConnectionStatus> => {
    const response = await apiClient.get<QuickBooksConnectionStatus>('/api/v1/integrations/xero/status', {
      params: workspaceId ? { workspace_id: workspaceId } : undefined,
    })
    return response.data
  },

  connect: async (workspaceId?: string): Promise<{ authorization_url: string }> => {
    const response = await apiClient.post<{ authorization_url: string }>('/api/v1/integrations/xero/connect', {
      workspace_id: workspaceId,
    })
    return response.data
  },

  sync: async (workspaceId?: string): Promise<QuickBooksConnectionStatus> => {
    const response = await apiClient.post<QuickBooksConnectionStatus>('/api/v1/integrations/xero/sync', {
      workspace_id: workspaceId,
    })
    return response.data
  },

  references: async (resourceType?: QuickBooksReferenceItem['resource_type'], workspaceId?: string): Promise<{ items: QuickBooksReferenceItem[]; total: number }> => {
    const response = await apiClient.get<{ items: QuickBooksReferenceItem[]; total: number }>('/api/v1/integrations/xero/reference-data', {
      params: {
        ...(resourceType ? { resource_type: resourceType } : {}),
        ...(workspaceId ? { workspace_id: workspaceId } : {}),
      },
    })
    return response.data
  },

  disconnect: async (workspaceId?: string): Promise<QuickBooksConnectionStatus> => {
    const response = await apiClient.delete<QuickBooksConnectionStatus>('/api/v1/integrations/xero', {
      params: workspaceId ? { workspace_id: workspaceId } : undefined,
    })
    return response.data
  },
}

export const accountingDestinationApi = {
  get: async (workspaceId?: string): Promise<AccountingDestination> => {
    const response = await apiClient.get<{ destination: AccountingDestination }>('/api/v1/integrations/destination', {
      params: workspaceId ? { workspace_id: workspaceId } : undefined,
    })
    return response.data.destination
  },

  set: async (destination: AccountingDestination, workspaceId?: string): Promise<AccountingDestination> => {
    const response = await apiClient.put<{ destination: AccountingDestination }>('/api/v1/integrations/destination', {
      destination,
      workspace_id: workspaceId,
    })
    return response.data.destination
  },
}

export const emailIntakeApi = {
  getAddress: async (workspaceId?: string): Promise<EmailIntakeAddress> => {
    const response = await apiClient.get<EmailIntakeAddress>('/api/v1/email-intake/address', {
      params: workspaceId ? { workspace_id: workspaceId } : undefined,
    })
    return response.data
  },

  listMessages: async (workspaceId?: string): Promise<{ messages: EmailIntakeMessage[]; total: number }> => {
    const response = await apiClient.get<{ messages: EmailIntakeMessage[]; total: number }>('/api/v1/email-intake/messages', {
      params: workspaceId ? { workspace_id: workspaceId } : undefined,
    })
    return response.data
  },
}

export const companyApi = {
  list: async (workspaceId: string): Promise<{ companies: CompanySummary[]; total: number }> => {
    const response = await apiClient.get<{ companies: CompanySummary[]; total: number }>('/api/v1/companies', {
      params: { workspace_id: workspaceId },
    })
    return response.data
  },

  create: async (workspaceId: string, payload: { name: string }): Promise<CompanySummary> => {
    const response = await apiClient.post<{ company: CompanySummary }>('/api/v1/companies', {
      workspace_id: workspaceId,
      ...payload,
    })
    return response.data.company
  },

  get: async (companyId: string): Promise<CompanySummary> => {
    const response = await apiClient.get<{ company: CompanySummary }>(`/api/v1/companies/${companyId}`)
    return response.data.company
  },

  update: async (companyId: string, payload: { name?: string }): Promise<CompanySummary> => {
    const response = await apiClient.patch<{ company: CompanySummary }>(`/api/v1/companies/${companyId}`, payload)
    return response.data.company
  },
}

export const workspaceApi = {
  list: async (): Promise<{ workspaces: WorkspaceRecord[]; active_workspace_id?: string | null }> => {
    const response = await apiClient.get('/api/v1/workspaces')
    return response.data
  },

  create: async (name: string): Promise<WorkspaceRecord> => {
    const response = await apiClient.post<{ workspace: WorkspaceRecord }>('/api/v1/workspaces', { name })
    return response.data.workspace
  },

  select: async (workspaceId: string): Promise<WorkspaceRecord> => {
    const response = await apiClient.put<{ workspace: WorkspaceRecord }>(`/api/v1/workspaces/${workspaceId}/active`)
    return response.data.workspace
  },

  members: async (workspaceId: string): Promise<{ members: WorkspaceMember[]; total: number }> => {
    const response = await apiClient.get(`/api/v1/workspaces/${workspaceId}/members`)
    return response.data
  },

  inviteReviewer: async (workspaceId: string, email: string): Promise<WorkspaceMember> => {
    const response = await apiClient.post<{ member: WorkspaceMember }>(`/api/v1/workspaces/${workspaceId}/members`, { email })
    return response.data.member
  },

  revokeReviewer: async (workspaceId: string, membershipId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/workspaces/${workspaceId}/members/${membershipId}`)
  },

  acceptInvite: async (token: string): Promise<WorkspaceMember> => {
    const response = await apiClient.post<{ member: WorkspaceMember }>(`/api/v1/workspaces/invite/${encodeURIComponent(token)}/accept`)
    return response.data.member
  },
}

export const clientIntakeApi = {
  listLinks: async (workspaceId: string): Promise<{ links: ClientUploadLink[]; total: number }> => {
    const response = await apiClient.get('/api/v1/client-intake/links', { params: { workspace_id: workspaceId } })
    return response.data
  },

  createLink: async (
    workspaceId: string,
    data: { label: string; expires_in_hours: number; max_submissions: number },
  ): Promise<{ link: ClientUploadLink; upload_url: string }> => {
    const response = await apiClient.post('/api/v1/client-intake/links', { workspace_id: workspaceId, ...data })
    return response.data
  },

  revokeLink: async (workspaceId: string, linkId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/client-intake/links/${linkId}`, { params: { workspace_id: workspaceId } })
  },

  listSubmissions: async (workspaceId: string): Promise<{ submissions: ClientUploadSubmission[]; total: number }> => {
    const response = await apiClient.get('/api/v1/client-intake/submissions', { params: { workspace_id: workspaceId } })
    return response.data
  },

  getPublicContext: async (token: string): Promise<{ label: string; workspace_name: string; expires_at: string }> => {
    const response = await apiClient.get(`/api/v1/client-intake/public/${encodeURIComponent(token)}`)
    return response.data
  },

  getPublicStatus: async (token: string): Promise<ClientStatusView> => {
    const response = await apiClient.get<ClientStatusView>(`/api/v1/client-intake/public/${encodeURIComponent(token)}/status`)
    return response.data
  },

  analytics: async (workspaceId: string, lateDays = 14): Promise<{ clients: ClientAnalyticsRow[]; total: number }> => {
    const response = await apiClient.get<{ clients: ClientAnalyticsRow[]; total: number }>('/api/v1/client-intake/analytics', {
      params: { workspace_id: workspaceId, late_days: lateDays },
    })
    return response.data
  },

  submitPublicFiles: async (token: string, files: File[]): Promise<{ accepted: boolean; submission_id: string; status: string }> => {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    const response = await apiClient.post(`/api/v1/client-intake/public/${encodeURIComponent(token)}/upload`, formData, {
      headers: { 'Content-Type': undefined },
      timeout: isMobile ? 120000 : 90000,
    })
    return response.data
  },
}

export const connectedSourcesApi = {
  list: async (workspaceId: string): Promise<ConnectedSourcesListResponse> => {
    const response = await apiClient.get<ConnectedSourcesListResponse>('/api/v1/connected-sources', {
      params: { workspace_id: workspaceId },
    })
    return response.data
  },

  startConnect: async (
    workspaceId: string,
    provider: ConnectedSourceProvider,
    redirectAfter?: string,
  ): Promise<{ authorization_url: string }> => {
    const response = await apiClient.post<{ authorization_url: string }>('/api/v1/connected-sources/connect', {
      workspace_id: workspaceId,
      provider,
      redirect_after: redirectAfter,
    })
    return response.data
  },

  updateFolder: async (
    sourceId: string,
    payload: { watched_folder?: string; watched_folder_id?: string; display_label?: string },
  ): Promise<{ source: ConnectedSource }> => {
    const response = await apiClient.patch<{ source: ConnectedSource }>(
      `/api/v1/connected-sources/${sourceId}`,
      payload,
    )
    return response.data
  },

  disconnect: async (sourceId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/connected-sources/${sourceId}`)
  },

  triggerSync: async (sourceId: string): Promise<{ source: ConnectedSource }> => {
    const response = await apiClient.post<{ source: ConnectedSource }>(
      `/api/v1/connected-sources/${sourceId}/sync`,
    )
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
        ? `${publicConfig.wsUrl}/api/v1/ws/session/${this.sessionId}?token=${token}`
        : `${publicConfig.wsUrl}/api/v1/ws/session/${this.sessionId}`

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

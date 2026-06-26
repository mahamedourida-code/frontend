import type {
  DocumentDuplicateWarning,
  QuickBooksReceiptPublication,
  VendorRule,
} from "@/lib/api-client"

export type WorkspaceBanner = {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  tone?: "info" | "warning" | "error"
}

export type OutputMode = "table" | "text" | "csv"
export type ResultFilter = "all" | "needs_review" | "ready" | "edited" | "failed" | "published"
export type ResultFile = {
  file_id?: string
  filename?: string
  size_bytes?: number
  input_preview_url?: string
  document_id?: string
  draft_bill_item_id?: string
  processing_unit_id?: string
  source_page?: number | null
  source_page_count?: number | null
  confidence_score?: number
  confidence?: number
  quality_score?: number
  requires_review?: boolean
  review_flags?: Array<Record<string, any>>
  status?: string
  review_status?: string
  review_grid?: any[][]
  uncertain_cells?: number[][]
  /**
   * Optional per-cell confidence scores aligned to the raw `review_grid`
   * (0–1 or 0–100). Forward-compatible: consumed by the per-field confidence
   * layer when the pipeline sends it, ignored (heuristics take over) when absent.
   */
  cell_confidence?: number[][]
  certainty?: number
  document_type?: string
  reviewed_data?: Record<string, any>
  duplicate_warnings?: DocumentDuplicateWarning[]
  vendor_suggestion?: VendorRule | null
  quickbooks_receipt_publication?: QuickBooksReceiptPublication | null
  original_image?: string
  metadata?: Record<string, any>
}

export type RecoverableJob = {
  processed_images?: number
  total_images?: number
}

export type ResultPreview = {
  table: any[][]
  text: string
  loading?: boolean
}

export type RecentBatchFile = {
  id: string
  filename: string
  status: string
  createdAt: string
}

export type BookkeeperFigures = { currency?: any; subtotal?: any; vat?: any; total?: any }

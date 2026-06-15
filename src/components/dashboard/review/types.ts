import type { ProcessedFile } from "@/lib/api-client"

export type WorkspaceOutputMode = "table" | "text" | "csv"

export type ResultPreview = {
  table: any[][]
  text: string
  loading?: boolean
}

export type ResultSourceTrace = {
  document_id: string
  original_filename: string
  input_preview_url?: string
  source_page?: number | null
  source_page_count?: number | null
}

export type DurableWorkspaceResultFile = Partial<ProcessedFile> & {
  filename: string
  original_filename?: string
  document_id: string
}

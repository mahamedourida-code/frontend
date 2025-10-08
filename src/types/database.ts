export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          plan_type: 'free' | 'pro' | 'enterprise'
          usage_credits: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: 'free' | 'pro' | 'enterprise'
          usage_credits?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: 'free' | 'pro' | 'enterprise'
          usage_credits?: number
          created_at?: string
          updated_at?: string
        }
      }
      ocr_projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed'
          original_image_url: string | null
          original_filename: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          original_image_url?: string | null
          original_filename?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          original_image_url?: string | null
          original_filename?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ocr_results: {
        Row: {
          id: string
          project_id: string
          extracted_data: any | null // JSONB
          confidence_score: number | null
          processing_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          extracted_data?: any | null
          confidence_score?: number | null
          processing_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          extracted_data?: any | null
          confidence_score?: number | null
          processing_time_ms?: number | null
          created_at?: string
        }
      }
      usage_logs: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          credits_used: number
          action_type: 'ocr_process' | 'export_excel' | 'export_csv' | 'export_json'
          timestamp: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          credits_used?: number
          action_type: 'ocr_process' | 'export_excel' | 'export_csv' | 'export_json'
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          credits_used?: number
          action_type?: 'ocr_process' | 'export_excel' | 'export_csv' | 'export_json'
          timestamp?: string
        }
      }
      exports: {
        Row: {
          id: string
          project_id: string
          user_id: string
          format: 'excel' | 'csv' | 'json'
          file_url: string | null
          filename: string | null
          exported_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          format: 'excel' | 'csv' | 'json'
          file_url?: string | null
          filename?: string | null
          exported_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          format?: 'excel' | 'csv' | 'json'
          file_url?: string | null
          filename?: string | null
          exported_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      deduct_credits: {
        Args: {
          user_uuid: string
          credits_to_deduct: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type OCRProject = Database['public']['Tables']['ocr_projects']['Row']
export type OCRProjectInsert = Database['public']['Tables']['ocr_projects']['Insert']
export type OCRProjectUpdate = Database['public']['Tables']['ocr_projects']['Update']

export type OCRResult = Database['public']['Tables']['ocr_results']['Row']
export type OCRResultInsert = Database['public']['Tables']['ocr_results']['Insert']
export type OCRResultUpdate = Database['public']['Tables']['ocr_results']['Update']

export type UsageLog = Database['public']['Tables']['usage_logs']['Row']
export type UsageLogInsert = Database['public']['Tables']['usage_logs']['Insert']
export type UsageLogUpdate = Database['public']['Tables']['usage_logs']['Update']

export type Export = Database['public']['Tables']['exports']['Row']
export type ExportInsert = Database['public']['Tables']['exports']['Insert']
export type ExportUpdate = Database['public']['Tables']['exports']['Update']

// Status enums
export type ProjectStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type PlanType = 'free' | 'pro' | 'enterprise'
export type ActionType = 'ocr_process' | 'export_excel' | 'export_csv' | 'export_json'
export type ExportFormat = 'excel' | 'csv' | 'json'

// Extended types with relations
export interface OCRProjectWithResults extends OCRProject {
  ocr_results?: OCRResult[]
  exports?: Export[]
}

export interface ProfileWithProjects extends Profile {
  ocr_projects?: OCRProject[]
  usage_logs?: UsageLog[]
}

// OCR specific types
export interface ExtractedData {
  tables?: Array<{
    headers: string[]
    rows: string[][]
    confidence?: number
  }>
  text?: string
  structured_data?: Record<string, any>
  metadata?: {
    total_characters: number
    total_words: number
    processing_method: string
  }
}
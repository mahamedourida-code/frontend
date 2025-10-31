export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      job_history: {
        Row: {
          created_at: string | null
          filename: string | null
          id: string
          original_job_id: string
          processing_metadata: Json | null
          result_url: string | null
          saved_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          filename?: string | null
          id: string
          original_job_id: string
          processing_metadata?: Json | null
          result_url?: string | null
          saved_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          filename?: string | null
          id?: string
          original_job_id?: string
          processing_metadata?: Json | null
          result_url?: string | null
          saved_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      processing_jobs: {
        Row: {
          created_at: string | null
          error_message: string | null
          filename: string
          id: string
          image_url: string | null
          processing_metadata: Json | null
          result_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          filename: string
          id?: string
          image_url?: string | null
          processing_metadata?: Json | null
          result_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          filename?: string
          id?: string
          image_url?: string | null
          processing_metadata?: Json | null
          result_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          plan_type: string | null
          updated_at: string | null
          usage_credits: number | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          plan_type?: string | null
          updated_at?: string | null
          usage_credits?: number | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          plan_type?: string | null
          updated_at?: string | null
          usage_credits?: number | null
          username?: string | null
        }
        Relationships: []
      }
      share_sessions: {
        Row: {
          access_count: number | null
          accessed_at: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          file_ids: Json
          id: string
          is_active: boolean | null
          metadata: Json | null
          session_id: string
          title: string | null
          user_id: string | null
        }
        Insert: {
          access_count?: number | null
          accessed_at?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          file_ids: Json
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          session_id: string
          title?: string | null
          user_id?: string | null
        }
        Update: {
          access_count?: number | null
          accessed_at?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          file_ids?: Json
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          session_id?: string
          title?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          id: string
          last_updated: string | null
          reset_date: string
          total_credits: number
          used_credits: number
          user_id: string
        }
        Insert: {
          id?: string
          last_updated?: string | null
          reset_date?: string
          total_credits?: number
          used_credits?: number
          user_id: string
        }
        Update: {
          id?: string
          last_updated?: string | null
          reset_date?: string
          total_credits?: number
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string | null
          last_processed_at: string | null
          total_processed: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          last_processed_at?: string | null
          total_processed?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          last_processed_at?: string | null
          total_processed?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {
      increment_processed_count: {
        Args: { p_count?: number; p_user_id: string }
        Returns: number
      }
      use_credits: {
        Args: { p_credits: number; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {}
    CompositeTypes: {}
  }
}

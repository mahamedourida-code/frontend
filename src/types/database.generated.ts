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
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_job_history: {
        Args: Record<PropertyKey, never>
        Returns: {
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
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

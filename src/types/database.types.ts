export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      exports: {
        Row: {
          exported_at: string | null
          file_url: string | null
          filename: string | null
          format: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          exported_at?: string | null
          file_url?: string | null
          filename?: string | null
          format: string
          id?: string
          project_id: string
          user_id: string
        }
        Update: {
          exported_at?: string | null
          file_url?: string | null
          filename?: string | null
          format?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ocr_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      extracted_data: {
        Row: {
          bounding_boxes: Json | null
          confidence_score: number | null
          created_at: string | null
          extraction_method: string | null
          id: string
          job_id: string | null
          table_data: Json
        }
        Insert: {
          bounding_boxes?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          extraction_method?: string | null
          id?: string
          job_id?: string | null
          table_data: Json
        }
        Update: {
          bounding_boxes?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          extraction_method?: string | null
          id?: string
          job_id?: string | null
          table_data?: Json
        }
        Relationships: [
          {
            foreignKeyName: "extracted_data_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "processing_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      job_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          execution_time_ms: number | null
          id: string
          job_id: string | null
          status: string
          step: string
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          execution_time_ms?: number | null
          id?: string
          job_id?: string | null
          status: string
          step: string
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          execution_time_ms?: number | null
          id?: string
          job_id?: string | null
          status?: string
          step?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "processing_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_projects: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          original_filename: string | null
          original_image_url: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          original_filename?: string | null
          original_image_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          original_filename?: string | null
          original_image_url?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ocr_results: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          extracted_data: Json | null
          id: string
          processing_time_ms: number | null
          project_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          processing_time_ms?: number | null
          project_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          extracted_data?: Json | null
          id?: string
          processing_time_ms?: number | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocr_results_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ocr_projects"
            referencedColumns: ["id"]
          },
        ]
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
      usage_logs: {
        Row: {
          action_type: string
          credits_used: number | null
          id: string
          project_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          credits_used?: number | null
          id?: string
          project_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          credits_used?: number | null
          id?: string
          project_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "ocr_projects"
            referencedColumns: ["id"]
          },
        ]
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
      deduct_credits: {
        Args: { credits_to_deduct: number; user_uuid: string }
        Returns: boolean
      }
      get_user_credits: {
        Args: { p_user_id: string }
        Returns: {
          available_credits: number
          total_credits: number
          used_credits: number
        }[]
      }
      get_user_job_history: {
        Args: never
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
        SetofOptions: {
          from: "*"
          to: "job_history"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      increment_session_access: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      use_credits: {
        Args: { p_credits: number; p_user_id: string }
        Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_recommendations: {
        Row: {
          conversation_id: string | null
          created_at: string
          id: string
          module_id: string
          opened: boolean
          opened_at: string | null
          reason: string | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          module_id: string
          opened?: boolean
          opened_at?: string | null
          reason?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          id?: string
          module_id?: string
          opened?: boolean
          opened_at?: string | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_recommendations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          code: string
          created_at: string
          feedback: string | null
          id: string
          language: string
          module_id: string
          problem_id: string
          score: number | null
          status: string
          user_id: string
        }
        Insert: {
          code?: string
          created_at?: string
          feedback?: string | null
          id?: string
          language?: string
          module_id: string
          problem_id: string
          score?: number | null
          status?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          feedback?: string | null
          id?: string
          language?: string
          module_id?: string
          problem_id?: string
          score?: number | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          archived: boolean
          created_at: string
          id: string
          last_message_at: string
          pinned: boolean
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          id?: string
          last_message_at?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          id?: string
          last_message_at?: string
          pinned?: boolean
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_activity: {
        Row: {
          assignments_submitted: number
          day: string
          id: string
          messages_sent: number
          modules_opened: number
          practice_attempts: number
          total_score: number
          user_id: string
        }
        Insert: {
          assignments_submitted?: number
          day: string
          id?: string
          messages_sent?: number
          modules_opened?: number
          practice_attempts?: number
          total_score?: number
          user_id: string
        }
        Update: {
          assignments_submitted?: number
          day?: string
          id?: string
          messages_sent?: number
          modules_opened?: number
          practice_attempts?: number
          total_score?: number
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json
          model: string | null
          role: string
          tokens_in: number | null
          tokens_out: number | null
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json
          model?: string | null
          role: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json
          model?: string | null
          role?: string
          tokens_in?: number | null
          tokens_out?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      module_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          last_opened_at: string
          module_id: string
          percent: number
          status: string
          time_spent_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_opened_at?: string
          module_id: string
          percent?: number
          status?: string
          time_spent_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          last_opened_at?: string
          module_id?: string
          percent?: number
          status?: string
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monitor_events: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          kind: string
          module_id: string | null
          problem_id: string | null
          session_kind: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
          module_id?: string | null
          problem_id?: string | null
          session_kind: string
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          module_id?: string | null
          problem_id?: string | null
          session_kind?: string
          user_id?: string
        }
        Relationships: []
      }
      practice_attempts: {
        Row: {
          answers: Json
          created_at: string
          duration_seconds: number
          id: string
          module_id: string
          score: number
          terminated: boolean
          total: number
          user_id: string
          violations: number
        }
        Insert: {
          answers?: Json
          created_at?: string
          duration_seconds?: number
          id?: string
          module_id: string
          score?: number
          terminated?: boolean
          total?: number
          user_id: string
          violations?: number
        }
        Update: {
          answers?: Json
          created_at?: string
          duration_seconds?: number
          id?: string
          module_id?: string
          score?: number
          terminated?: boolean
          total?: number
          user_id?: string
          violations?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          leetcode: string | null
          linkedin: string | null
          onboarded: boolean
          selected_track: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          leetcode?: string | null
          linkedin?: string | null
          onboarded?: boolean
          selected_track?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          leetcode?: string | null
          linkedin?: string | null
          onboarded?: boolean
          selected_track?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          current_streak: number
          last_active_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          last_active_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bump_activity: {
        Args: {
          _delta?: number
          _kind: string
          _score?: number
          _user_id: string
        }
        Returns: undefined
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

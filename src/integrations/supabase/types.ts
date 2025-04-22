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
      ai_memory: {
        Row: {
          content: string
          created_at: string | null
          embedding: string
          id: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          embedding: string
          id?: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          embedding?: string
          id?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string | null
          id: string
          name: string
          status: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          status: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          status?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          created_at: string | null
          id: string
          industry: string
          name: string
          revenue_tier: string | null
          team_size: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          industry: string
          name: string
          revenue_tier?: string | null
          team_size: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          industry?: string
          name?: string
          revenue_tier?: string | null
          team_size?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      export_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          delivery_method: string
          error_message: string | null
          export_type: string
          id: string
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          delivery_method: string
          error_message?: string | null
          export_type: string
          id?: string
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          delivery_method?: string
          error_message?: string | null
          export_type?: string
          id?: string
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      kpi_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric: string
          tenant_id: string | null
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric: string
          tenant_id?: string | null
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metric?: string
          tenant_id?: string | null
          updated_at?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          description: string | null
          event_type: string
          id: string
          is_read: boolean | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_type: string
          id?: string
          is_read?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_type?: string
          id?: string
          is_read?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      persona_profiles: {
        Row: {
          channels: string[] | null
          created_at: string | null
          goal: string | null
          id: string
          pain_points: string[] | null
          sell_type: string | null
          tenant_id: string
          tone: string | null
          tools: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channels?: string[] | null
          created_at?: string | null
          goal?: string | null
          id?: string
          pain_points?: string[] | null
          sell_type?: string | null
          tenant_id: string
          tone?: string | null
          tools?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channels?: string[] | null
          created_at?: string | null
          goal?: string | null
          id?: string
          pain_points?: string[] | null
          sell_type?: string | null
          tenant_id?: string
          tone?: string | null
          tools?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plugin_usage_logs: {
        Row: {
          count: number
          created_at: string
          event: string
          id: string
          plugin_key: string
          tenant_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          event: string
          id?: string
          plugin_key: string
          tenant_id: string
        }
        Update: {
          count?: number
          created_at?: string
          event?: string
          id?: string
          plugin_key?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          company_size: string | null
          created_at: string
          id: string
          industry: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          id: string
          industry?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          company_size?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          claimed_at: string | null
          created_at: string
          id: string
          referred_user_email: string
          referred_user_id: string | null
          referrer_user_id: string
        }
        Insert: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          referred_user_email: string
          referred_user_id?: string | null
          referrer_user_id: string
        }
        Update: {
          claimed_at?: string | null
          created_at?: string
          id?: string
          referred_user_email?: string
          referred_user_id?: string | null
          referrer_user_id?: string
        }
        Relationships: []
      }
      retry_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          last_attempt_at: string | null
          max_attempts: number
          next_attempt_at: string | null
          payload: Json
          retry_count: number
          status: string
          task: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          next_attempt_at?: string | null
          payload?: Json
          retry_count?: number
          status?: string
          task: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          last_attempt_at?: string | null
          max_attempts?: number
          next_attempt_at?: string | null
          payload?: Json
          retry_count?: number
          status?: string
          task?: string
          tenant_id?: string
        }
        Relationships: []
      }
      strategy_feedback: {
        Row: {
          action: string
          created_at: string
          id: string
          strategy_title: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          strategy_title: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          strategy_title?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          created_at: string
          event_type: string
          id: string
          message: string
          meta: Json | null
          tenant_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          message: string
          meta?: Json | null
          tenant_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          message?: string
          meta?: Json | null
          tenant_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_analytics: {
        Row: {
          active_users: number | null
          created_at: string | null
          id: string
          mrr: number | null
          tenant_id: string
          total_strategies: number | null
          updated_at: string | null
        }
        Insert: {
          active_users?: number | null
          created_at?: string | null
          id?: string
          mrr?: number | null
          tenant_id: string
          total_strategies?: number | null
          updated_at?: string | null
        }
        Update: {
          active_users?: number | null
          created_at?: string | null
          id?: string
          mrr?: number | null
          tenant_id?: string
          total_strategies?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_plugin_configs: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          plugin_key: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          id?: string
          plugin_key: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          plugin_key?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      tenant_plugins: {
        Row: {
          created_at: string | null
          enabled: boolean
          id: string
          plugin_key: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          plugin_key: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          plugin_key?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_plugins_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          updated_at: string | null
          usage_credits: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          usage_credits?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          usage_credits?: number
        }
        Relationships: []
      }
      tenant_user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_strategies: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          tenant_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_strategies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      user_role: "admin" | "editor" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const

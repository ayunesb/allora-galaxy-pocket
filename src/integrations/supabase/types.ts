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
      agent_alerts: {
        Row: {
          agent: string
          alert_type: string
          id: string
          message: string
          status: string | null
          tenant_id: string
          triggered_at: string | null
        }
        Insert: {
          agent: string
          alert_type: string
          id?: string
          message: string
          status?: string | null
          tenant_id: string
          triggered_at?: string | null
        }
        Update: {
          agent?: string
          alert_type?: string
          id?: string
          message?: string
          status?: string | null
          tenant_id?: string
          triggered_at?: string | null
        }
        Relationships: []
      }
      agent_assignments: {
        Row: {
          agent: string
          assigned_at: string
          id: string
          tenant_id: string
        }
        Insert: {
          agent: string
          assigned_at?: string
          id?: string
          tenant_id: string
        }
        Update: {
          agent?: string
          assigned_at?: string
          id?: string
          tenant_id?: string
        }
        Relationships: []
      }
      agent_blueprints: {
        Row: {
          agent_name: string
          capabilities: string[]
          created_at: string
          id: string
          last_prompt_id: string | null
          mission: string
          output_schema: string
          personas: string[]
          prompt: string
          task_type: string
        }
        Insert: {
          agent_name: string
          capabilities: string[]
          created_at?: string
          id?: string
          last_prompt_id?: string | null
          mission: string
          output_schema: string
          personas: string[]
          prompt: string
          task_type: string
        }
        Update: {
          agent_name?: string
          capabilities?: string[]
          created_at?: string
          id?: string
          last_prompt_id?: string | null
          mission?: string
          output_schema?: string
          personas?: string[]
          prompt?: string
          task_type?: string
        }
        Relationships: []
      }
      agent_collaboration: {
        Row: {
          agent: string
          created_at: string | null
          id: string
          message: string
          session_id: string
          tenant_id: string
        }
        Insert: {
          agent: string
          created_at?: string | null
          id?: string
          message: string
          session_id: string
          tenant_id: string
        }
        Update: {
          agent?: string
          created_at?: string | null
          id?: string
          message?: string
          session_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_collaboration"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_collaboration"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_feedback: {
        Row: {
          agent: string
          created_at: string | null
          feedback: string | null
          id: string
          rating: number | null
          task_id: string | null
          tenant_id: string
          type: string | null
        }
        Insert: {
          agent: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating?: number | null
          task_id?: string | null
          tenant_id: string
          type?: string | null
        }
        Update: {
          agent?: string
          created_at?: string | null
          feedback?: string | null
          id?: string
          rating?: number | null
          task_id?: string | null
          tenant_id?: string
          type?: string | null
        }
        Relationships: []
      }
      agent_memory: {
        Row: {
          agent_name: string
          ai_feedback: string | null
          ai_rating: number | null
          context: string
          id: string
          is_user_submitted: boolean | null
          remix_count: number | null
          tenant_id: string
          timestamp: string | null
          type: string
          xp_delta: number | null
        }
        Insert: {
          agent_name: string
          ai_feedback?: string | null
          ai_rating?: number | null
          context: string
          id?: string
          is_user_submitted?: boolean | null
          remix_count?: number | null
          tenant_id: string
          timestamp?: string | null
          type: string
          xp_delta?: number | null
        }
        Update: {
          agent_name?: string
          ai_feedback?: string | null
          ai_rating?: number | null
          context?: string
          id?: string
          is_user_submitted?: boolean | null
          remix_count?: number | null
          tenant_id?: string
          timestamp?: string | null
          type?: string
          xp_delta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_performance_logs: {
        Row: {
          agent_name: string
          created_at: string | null
          feedback_score: number | null
          id: string
          metrics: Json | null
          notes: string | null
          strategy_id: string | null
          success_rate: number | null
          tenant_id: string
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          strategy_id?: string | null
          success_rate?: number | null
          tenant_id: string
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          feedback_score?: number | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          strategy_id?: string | null
          success_rate?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_logs_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_performance_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_performance_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          agent_name: string
          avatar_url: string | null
          channels: string[] | null
          created_at: string | null
          created_by: string | null
          enabled_tools: string[] | null
          id: string
          language: string
          last_memory_update: string | null
          memory_scope: string[] | null
          memory_score: number | null
          role: string
          tenant_id: string
          tone: string
          updated_at: string | null
        }
        Insert: {
          agent_name: string
          avatar_url?: string | null
          channels?: string[] | null
          created_at?: string | null
          created_by?: string | null
          enabled_tools?: string[] | null
          id?: string
          language?: string
          last_memory_update?: string | null
          memory_scope?: string[] | null
          memory_score?: number | null
          role: string
          tenant_id: string
          tone: string
          updated_at?: string | null
        }
        Update: {
          agent_name?: string
          avatar_url?: string | null
          channels?: string[] | null
          created_at?: string | null
          created_by?: string | null
          enabled_tools?: string[] | null
          id?: string
          language?: string
          last_memory_update?: string | null
          memory_scope?: string[] | null
          memory_score?: number | null
          role?: string
          tenant_id?: string
          tone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agent_prompt_versions: {
        Row: {
          agent_name: string
          created_at: string | null
          edited_by: string | null
          explanation: string | null
          id: string
          prompt: string
          tenant_id: string
          version: number
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          edited_by?: string | null
          explanation?: string | null
          id?: string
          prompt: string
          tenant_id: string
          version: number
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          edited_by?: string | null
          explanation?: string | null
          id?: string
          prompt?: string
          tenant_id?: string
          version?: number
        }
        Relationships: []
      }
      agent_prompt_votes: {
        Row: {
          agent_name: string
          created_at: string | null
          id: string
          tenant_id: string
          version: number
          vote: number
          voter_agent: string
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          id?: string
          tenant_id: string
          version: number
          vote: number
          voter_agent: string
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          id?: string
          tenant_id?: string
          version?: number
          vote?: number
          voter_agent?: string
        }
        Relationships: []
      }
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
      assistant_logs: {
        Row: {
          agent_id: string | null
          command: string
          created_at: string | null
          feedback: string | null
          feedback_type: string | null
          id: string
          response: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          command: string
          created_at?: string | null
          feedback?: string | null
          feedback_type?: string | null
          id?: string
          response: string
          tenant_id: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          command?: string
          created_at?: string | null
          feedback?: string | null
          feedback_type?: string | null
          id?: string
          response?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_metrics: {
        Row: {
          ai_count: number | null
          created_at: string | null
          human_count: number | null
          id: string
          metric_name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          ai_count?: number | null
          created_at?: string | null
          human_count?: number | null
          id?: string
          metric_name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          ai_count?: number | null
          created_at?: string | null
          human_count?: number | null
          id?: string
          metric_name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_profiles: {
        Row: {
          created_at: string
          credits: number
          id: string
          plan: string
          price_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_subscription_item_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          plan?: string
          price_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          plan?: string
          price_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_subscription_item_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          execution_metrics: Json | null
          execution_start_date: string | null
          execution_status: string | null
          generated_by_agent_id: string | null
          id: string
          last_metrics_update: string | null
          metrics: Json | null
          name: string
          scripts: Json | null
          status: string
          strategy_id: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          execution_metrics?: Json | null
          execution_start_date?: string | null
          execution_status?: string | null
          generated_by_agent_id?: string | null
          id?: string
          last_metrics_update?: string | null
          metrics?: Json | null
          name: string
          scripts?: Json | null
          status: string
          strategy_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          execution_metrics?: Json | null
          execution_start_date?: string | null
          execution_status?: string | null
          generated_by_agent_id?: string | null
          id?: string
          last_metrics_update?: string | null
          metrics?: Json | null
          name?: string
          scripts?: Json | null
          status?: string
          strategy_id?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      company_profiles: {
        Row: {
          created_at: string | null
          ga4_property_id: string | null
          id: string
          industry: string
          launch_mode: string | null
          name: string
          revenue_tier: string | null
          team_size: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          ga4_property_id?: string | null
          id?: string
          industry: string
          launch_mode?: string | null
          name: string
          revenue_tier?: string | null
          team_size: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          ga4_property_id?: string | null
          id?: string
          industry?: string
          launch_mode?: string | null
          name?: string
          revenue_tier?: string | null
          team_size?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_logs: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_usage_log: {
        Row: {
          agent_name: string
          created_at: string | null
          credits_used: number
          details: Json | null
          id: string
          module: string
          tenant_id: string
        }
        Insert: {
          agent_name: string
          created_at?: string | null
          credits_used: number
          details?: Json | null
          id?: string
          module: string
          tenant_id: string
        }
        Update: {
          agent_name?: string
          created_at?: string | null
          credits_used?: number
          details?: Json | null
          id?: string
          module?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_usage_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_usage_logs: {
        Row: {
          agent: string | null
          created_at: string
          credits_used: number
          id: string
          operation: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          agent?: string | null
          created_at?: string
          credits_used: number
          id?: string
          operation: string
          tenant_id: string
          user_id: string
        }
        Update: {
          agent?: string | null
          created_at?: string
          credits_used?: number
          id?: string
          operation?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      cron_job_logs: {
        Row: {
          function_name: string
          id: string
          message: string | null
          ran_at: string | null
          status: string
        }
        Insert: {
          function_name: string
          id?: string
          message?: string | null
          ran_at?: string | null
          status: string
        }
        Update: {
          function_name?: string
          id?: string
          message?: string | null
          ran_at?: string | null
          status?: string
        }
        Relationships: []
      }
      cron_job_metrics: {
        Row: {
          created_at: string | null
          error_count: number | null
          execution_time_ms: number | null
          function_name: string
          id: string
          last_execution_at: string | null
          memory_usage_mb: number | null
          success_rate: number | null
          tenant_id: string | null
          total_executions: number | null
        }
        Insert: {
          created_at?: string | null
          error_count?: number | null
          execution_time_ms?: number | null
          function_name: string
          id?: string
          last_execution_at?: string | null
          memory_usage_mb?: number | null
          success_rate?: number | null
          tenant_id?: string | null
          total_executions?: number | null
        }
        Update: {
          created_at?: string | null
          error_count?: number | null
          execution_time_ms?: number | null
          function_name?: string
          id?: string
          last_execution_at?: string | null
          memory_usage_mb?: number | null
          success_rate?: number | null
          tenant_id?: string | null
          total_executions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cron_job_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cron_job_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      data_pipeline_events: {
        Row: {
          completed_at: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          source: string
          status: string
          target: string
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          source: string
          status?: string
          target: string
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          source?: string
          status?: string
          target?: string
          tenant_id?: string
        }
        Relationships: []
      }
      demo_analytics: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          interaction_details: Json | null
          page_path: string | null
          session_id: string
          tenant_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          interaction_details?: Json | null
          page_path?: string | null
          session_id: string
          tenant_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          interaction_details?: Json | null
          page_path?: string | null
          session_id?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "demo_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demo_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      encrypted_tokens: {
        Row: {
          created_at: string | null
          encrypted_token: string
          expires_at: string | null
          id: string
          refresh_token: string | null
          service: string
          tenant_id: string | null
          token_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          encrypted_token: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          service: string
          tenant_id?: string | null
          token_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          encrypted_token?: string
          expires_at?: string | null
          id?: string
          refresh_token?: string | null
          service?: string
          tenant_id?: string | null
          token_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "encrypted_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "encrypted_tokens_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
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
      ga4_configs: {
        Row: {
          created_at: string | null
          id: string
          property_id: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          property_id: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          property_id?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ga4_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ga4_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_insights: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          id: string
          impact_level: string | null
          insight: string
          kpi_name: string
          outcome: string | null
          suggested_action: string | null
          tenant_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          impact_level?: string | null
          insight: string
          kpi_name: string
          outcome?: string | null
          suggested_action?: string | null
          tenant_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          id?: string
          impact_level?: string | null
          insight?: string
          kpi_name?: string
          outcome?: string | null
          suggested_action?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_insights_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_insights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_insights_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_metrics: {
        Row: {
          created_at: string | null
          id: string
          metric: string
          recorded_at: string
          tenant_id: string | null
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric: string
          recorded_at?: string
          tenant_id?: string | null
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metric?: string
          recorded_at?: string
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
          {
            foreignKeyName: "kpi_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_metrics_history: {
        Row: {
          created_at: string | null
          id: string
          metric: string
          recorded_at: string
          tenant_id: string
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          metric: string
          recorded_at?: string
          tenant_id: string
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          metric?: string
          recorded_at?: string
          tenant_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_metrics_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_metrics_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      log_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          log_id: string
          note: string | null
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_id: string
          note?: string | null
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          log_id?: string
          note?: string | null
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_bookmarks_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "system_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      memory_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          memory_id: string | null
          user_id: string | null
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          memory_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          memory_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memory_comments_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "agent_memory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memory_comments_memory_id_fkey"
            columns: ["memory_id"]
            isOneToOne: false
            referencedRelation: "most_remixed_memories"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_alert_logs: {
        Row: {
          id: string
          sent_at: string | null
          status: string | null
          strategy_id: string | null
          title: string | null
        }
        Insert: {
          id?: string
          sent_at?: string | null
          status?: string | null
          strategy_id?: string | null
          title?: string | null
        }
        Update: {
          id?: string
          sent_at?: string | null
          status?: string | null
          strategy_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestone_alert_logs_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
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
          {
            foreignKeyName: "notifications_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_logs: {
        Row: {
          component: string
          created_at: string | null
          duration_ms: number
          error_message: string | null
          id: string
          metadata: Json | null
          operation: string
          success: boolean
          tenant_id: string | null
        }
        Insert: {
          component: string
          created_at?: string | null
          duration_ms: number
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation: string
          success: boolean
          tenant_id?: string | null
        }
        Update: {
          component?: string
          created_at?: string | null
          duration_ms?: number
          error_message?: string | null
          id?: string
          metadata?: Json | null
          operation?: string
          success?: boolean
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
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
      plugin_certifications: {
        Row: {
          certification_level: string | null
          certified_at: string | null
          certified_by: string | null
          id: string
          plugin_id: string | null
        }
        Insert: {
          certification_level?: string | null
          certified_at?: string | null
          certified_by?: string | null
          id?: string
          plugin_id?: string | null
        }
        Update: {
          certification_level?: string | null
          certified_at?: string | null
          certified_by?: string | null
          id?: string
          plugin_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_certifications_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_creators: {
        Row: {
          id: string
          payout_percentage: number | null
          plugin_id: string | null
          stripe_connect_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          payout_percentage?: number | null
          plugin_id?: string | null
          stripe_connect_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          payout_percentage?: number | null
          plugin_id?: string | null
          stripe_connect_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_creators_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_installs: {
        Row: {
          enabled: boolean | null
          id: string
          installed_at: string | null
          last_checked_version: string | null
          plugin_id: string | null
          tenant_id: string
        }
        Insert: {
          enabled?: boolean | null
          id?: string
          installed_at?: string | null
          last_checked_version?: string | null
          plugin_id?: string | null
          tenant_id: string
        }
        Update: {
          enabled?: boolean | null
          id?: string
          installed_at?: string | null
          last_checked_version?: string | null
          plugin_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_installs_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_installs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_installs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_licenses: {
        Row: {
          created_at: string | null
          id: string
          license_key: string | null
          license_type: string | null
          mint_url: string | null
          plugin_id: string | null
          price_usd: number | null
          terms: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          license_key?: string | null
          license_type?: string | null
          mint_url?: string | null
          plugin_id?: string | null
          price_usd?: number | null
          terms?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          license_key?: string | null
          license_type?: string | null
          mint_url?: string | null
          plugin_id?: string | null
          price_usd?: number | null
          terms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_licenses_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_manifests: {
        Row: {
          created_at: string | null
          description: string | null
          entry_point: string
          id: string
          name: string
          schema: Json | null
          status: Database["public"]["Enums"]["plugin_status"] | null
          updated_at: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entry_point: string
          id?: string
          name: string
          schema?: Json | null
          status?: Database["public"]["Enums"]["plugin_status"] | null
          updated_at?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entry_point?: string
          id?: string
          name?: string
          schema?: Json | null
          status?: Database["public"]["Enums"]["plugin_status"] | null
          updated_at?: string | null
          version?: string
        }
        Relationships: []
      }
      plugin_permissions: {
        Row: {
          can_enable: boolean
          can_use: boolean
          created_at: string | null
          id: string
          plugin_key: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          can_enable?: boolean
          can_use?: boolean
          created_at?: string | null
          id?: string
          plugin_key: string
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          can_enable?: boolean
          can_use?: boolean
          created_at?: string | null
          id?: string
          plugin_key?: string
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      plugin_reviews: {
        Row: {
          created_at: string | null
          id: string
          plugin_id: string | null
          rating: number | null
          review: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          plugin_id?: string | null
          rating?: number | null
          review?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          plugin_id?: string | null
          rating?: number | null
          review?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plugin_reviews_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_reviews_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_sales: {
        Row: {
          buyer_tenant_id: string | null
          currency: string | null
          id: string
          license_key: string | null
          plugin_id: string | null
          price: number | null
          purchased_at: string | null
        }
        Insert: {
          buyer_tenant_id?: string | null
          currency?: string | null
          id?: string
          license_key?: string | null
          plugin_id?: string | null
          price?: number | null
          purchased_at?: string | null
        }
        Update: {
          buyer_tenant_id?: string | null
          currency?: string | null
          id?: string
          license_key?: string | null
          plugin_id?: string | null
          price?: number | null
          purchased_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_sales_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_sandbox_installs: {
        Row: {
          id: string
          plugin_submission_id: string | null
          preview_success: boolean | null
          schema_run: boolean | null
          tenant_id: string
          tested_at: string | null
        }
        Insert: {
          id?: string
          plugin_submission_id?: string | null
          preview_success?: boolean | null
          schema_run?: boolean | null
          tenant_id: string
          tested_at?: string | null
        }
        Update: {
          id?: string
          plugin_submission_id?: string | null
          preview_success?: boolean | null
          schema_run?: boolean | null
          tenant_id?: string
          tested_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_sandbox_installs_plugin_submission_id_fkey"
            columns: ["plugin_submission_id"]
            isOneToOne: false
            referencedRelation: "plugin_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_submissions: {
        Row: {
          description: string | null
          earnings: number | null
          github_repo_url: string | null
          id: string
          install_script: string | null
          installs: number | null
          is_public: boolean | null
          original_plugin_id: string | null
          plugin_name: string
          recommended_by_agent: string | null
          remix_count: number | null
          revenue_generated: number | null
          schema_sql: string | null
          status: string | null
          stripe_connect_id: string | null
          submitted_at: string | null
          tenant_id: string
          webhook_secret: string | null
          zip_url: string | null
        }
        Insert: {
          description?: string | null
          earnings?: number | null
          github_repo_url?: string | null
          id?: string
          install_script?: string | null
          installs?: number | null
          is_public?: boolean | null
          original_plugin_id?: string | null
          plugin_name: string
          recommended_by_agent?: string | null
          remix_count?: number | null
          revenue_generated?: number | null
          schema_sql?: string | null
          status?: string | null
          stripe_connect_id?: string | null
          submitted_at?: string | null
          tenant_id: string
          webhook_secret?: string | null
          zip_url?: string | null
        }
        Update: {
          description?: string | null
          earnings?: number | null
          github_repo_url?: string | null
          id?: string
          install_script?: string | null
          installs?: number | null
          is_public?: boolean | null
          original_plugin_id?: string | null
          plugin_name?: string
          recommended_by_agent?: string | null
          remix_count?: number | null
          revenue_generated?: number | null
          schema_sql?: string | null
          status?: string | null
          stripe_connect_id?: string | null
          submitted_at?: string | null
          tenant_id?: string
          webhook_secret?: string | null
          zip_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_submissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plugin_submissions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_usage_logs: {
        Row: {
          count: number
          created_at: string
          event: string
          event_type: string | null
          id: string
          page: string | null
          plugin_key: string
          tenant_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          event: string
          event_type?: string | null
          id?: string
          page?: string | null
          plugin_key: string
          tenant_id: string
        }
        Update: {
          count?: number
          created_at?: string
          event?: string
          event_type?: string | null
          id?: string
          page?: string | null
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
          {
            foreignKeyName: "plugin_usage_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      plugin_versions: {
        Row: {
          changelog: string | null
          created_at: string | null
          id: string
          plugin_id: string | null
          version_tag: string | null
          zip_url: string | null
        }
        Insert: {
          changelog?: string | null
          created_at?: string | null
          id?: string
          plugin_id?: string | null
          version_tag?: string | null
          zip_url?: string | null
        }
        Update: {
          changelog?: string | null
          created_at?: string | null
          id?: string
          plugin_id?: string | null
          version_tag?: string | null
          zip_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plugin_versions_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugins: {
        Row: {
          author: string | null
          badge: string | null
          category: string | null
          changelog: Json | null
          created_at: string | null
          description: string | null
          icon_url: string | null
          id: string
          install_url: string | null
          name: string
          slug: string | null
          version: string | null
        }
        Insert: {
          author?: string | null
          badge?: string | null
          category?: string | null
          changelog?: Json | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          install_url?: string | null
          name: string
          slug?: string | null
          version?: string | null
        }
        Update: {
          author?: string | null
          badge?: string | null
          category?: string | null
          changelog?: Json | null
          created_at?: string | null
          description?: string | null
          icon_url?: string | null
          id?: string
          install_url?: string | null
          name?: string
          slug?: string | null
          version?: string | null
        }
        Relationships: []
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
      recovery_strategies: {
        Row: {
          actions: Json | null
          alert_id: string | null
          assigned_agent: string | null
          created_at: string | null
          executed_at: string | null
          feedback_notes: string | null
          id: string
          learned: boolean | null
          status: string | null
          strategy_title: string
          summary: string | null
          tenant_id: string
        }
        Insert: {
          actions?: Json | null
          alert_id?: string | null
          assigned_agent?: string | null
          created_at?: string | null
          executed_at?: string | null
          feedback_notes?: string | null
          id?: string
          learned?: boolean | null
          status?: string | null
          strategy_title: string
          summary?: string | null
          tenant_id: string
        }
        Update: {
          actions?: Json | null
          alert_id?: string | null
          assigned_agent?: string | null
          created_at?: string | null
          executed_at?: string | null
          feedback_notes?: string | null
          id?: string
          learned?: boolean | null
          status?: string | null
          strategy_title?: string
          summary?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_strategies_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "agent_alerts"
            referencedColumns: ["id"]
          },
        ]
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
      role_change_logs: {
        Row: {
          changed_at: string | null
          changed_by: string | null
          id: string
          new_role: string
          previous_role: string | null
          reason: string | null
          user_id: string | null
        }
        Insert: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role: string
          previous_role?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Update: {
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_role?: string
          previous_role?: string | null
          reason?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_change_requests: {
        Row: {
          approved: boolean | null
          created_at: string | null
          id: string
          reason: string | null
          requested_role: string
          reviewed_by: string | null
          user_id: string | null
        }
        Insert: {
          approved?: boolean | null
          created_at?: string | null
          id?: string
          reason?: string | null
          requested_role: string
          reviewed_by?: string | null
          user_id?: string | null
        }
        Update: {
          approved?: boolean | null
          created_at?: string | null
          id?: string
          reason?: string | null
          requested_role?: string
          reviewed_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      route_logs: {
        Row: {
          created_at: string
          id: string
          role: string | null
          route: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string | null
          route: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string | null
          route?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          approved_at: string | null
          assigned_agent: string | null
          auto_approved: boolean | null
          created_at: string | null
          description: string | null
          diagnosis: Json | null
          failure_reason: string | null
          generated_by: string | null
          health_score: number | null
          id: string
          impact_score: number | null
          is_public: boolean | null
          metrics_baseline: Json | null
          onboarding_data: Json | null
          retry_prompt: string | null
          status: string | null
          tags: string[] | null
          tenant_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          assigned_agent?: string | null
          auto_approved?: boolean | null
          created_at?: string | null
          description?: string | null
          diagnosis?: Json | null
          failure_reason?: string | null
          generated_by?: string | null
          health_score?: number | null
          id?: string
          impact_score?: number | null
          is_public?: boolean | null
          metrics_baseline?: Json | null
          onboarding_data?: Json | null
          retry_prompt?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          assigned_agent?: string | null
          auto_approved?: boolean | null
          created_at?: string | null
          description?: string | null
          diagnosis?: Json | null
          failure_reason?: string | null
          generated_by?: string | null
          health_score?: number | null
          id?: string
          impact_score?: number | null
          is_public?: boolean | null
          metrics_baseline?: Json | null
          onboarding_data?: Json | null
          retry_prompt?: string | null
          status?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_approval_log: {
        Row: {
          approved_by: string | null
          created_at: string | null
          id: string
          strategy_id: string | null
          summary: string
          tenant_id: string | null
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          strategy_id?: string | null
          summary: string
          tenant_id?: string | null
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          id?: string
          strategy_id?: string | null
          summary?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_approval_log_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_approval_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_approval_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "strategy_feedback_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_usage_reports: {
        Row: {
          created_at: string
          credits_used: number
          id: string
          status: string
          stripe_usage_record_id: string | null
          subscription_item_id: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          credits_used: number
          id?: string
          status: string
          stripe_usage_record_id?: string | null
          subscription_item_id: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          credits_used?: number
          id?: string
          status?: string
          stripe_usage_record_id?: string | null
          subscription_item_id?: string
          tenant_id?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          change_type: string
          changed_at: string
          id: string
          new_tier: string | null
          old_tier: string | null
          tenant_id: string
        }
        Insert: {
          change_type: string
          changed_at?: string
          id?: string
          new_tier?: string | null
          old_tier?: string | null
          tenant_id: string
        }
        Update: {
          change_type?: string
          changed_at?: string
          id?: string
          new_tier?: string | null
          old_tier?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_tiers: {
        Row: {
          created_at: string
          features: Json
          id: string
          monthly_credits: number
          name: string
          price_id: string
          price_usd: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id?: string
          monthly_credits: number
          name: string
          price_id: string
          price_usd: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          monthly_credits?: number
          name?: string
          price_id?: string
          price_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      system_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          tenant_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          status?: string
          tenant_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          config: Json
          created_at: string
          key: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          key: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_health_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          id: string
          message: string
          resolved_at: string | null
          severity: string
          status: string | null
          tenant_id: string | null
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          id?: string
          message: string
          resolved_at?: string | null
          severity: string
          status?: string | null
          tenant_id?: string | null
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string
          resolved_at?: string | null
          severity?: string
          status?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_health_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_health_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
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
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          recorded_at: string | null
          tenant_id: string | null
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          recorded_at?: string | null
          tenant_id?: string | null
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          recorded_at?: string | null
          tenant_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "system_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          invitation_code: string | null
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
          invitation_code?: string | null
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
          invitation_code?: string | null
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
          {
            foreignKeyName: "team_invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
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
          {
            foreignKeyName: "tenant_analytics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
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
          {
            foreignKeyName: "tenant_plugins_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_profiles: {
        Row: {
          created_at: string | null
          enable_auto_approve: boolean | null
          id: string
          is_demo: boolean | null
          name: string | null
          slack_webhook_url: string | null
          theme_color: string | null
          theme_mode: string | null
          updated_at: string | null
          usage_credits: number
        }
        Insert: {
          created_at?: string | null
          enable_auto_approve?: boolean | null
          id?: string
          is_demo?: boolean | null
          name?: string | null
          slack_webhook_url?: string | null
          theme_color?: string | null
          theme_mode?: string | null
          updated_at?: string | null
          usage_credits?: number
        }
        Update: {
          created_at?: string | null
          enable_auto_approve?: boolean | null
          id?: string
          is_demo?: boolean | null
          name?: string | null
          slack_webhook_url?: string | null
          theme_color?: string | null
          theme_mode?: string | null
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
          {
            foreignKeyName: "tenant_user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          trust_score: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          trust_score?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          trust_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      vault_strategies: {
        Row: {
          confidence: string | null
          created_at: string | null
          description: string | null
          goal: string | null
          id: string
          industry: string | null
          status: string | null
          tenant_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string | null
          description?: string | null
          goal?: string | null
          id?: string
          industry?: string | null
          status?: string | null
          tenant_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string | null
          description?: string | null
          goal?: string | null
          id?: string
          industry?: string | null
          status?: string | null
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
          {
            foreignKeyName: "vault_strategies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_ai_summaries: {
        Row: {
          generated_at: string | null
          id: string
          metadata: Json | null
          summary: string
          tenant_id: string | null
          week_start: string
        }
        Insert: {
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          summary: string
          tenant_id?: string | null
          week_start: string
        }
        Update: {
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          summary?: string
          tenant_id?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_ai_summaries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weekly_ai_summaries_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      automation_ratios: {
        Row: {
          ai_count: number | null
          ai_percentage: number | null
          human_count: number | null
          metric_name: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      current_user_tenant_roles: {
        Row: {
          created_at: string | null
          id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_calculations: {
        Row: {
          active_campaigns: number | null
          approved_strategies: number | null
          executed_strategies: number | null
          strategy_approval_rate: number | null
          strategy_to_campaign_rate: number | null
          tenant_id: string | null
          total_campaigns: number | null
          total_strategies: number | null
        }
        Relationships: []
      }
      kpi_metrics_summary: {
        Row: {
          avg_value: number | null
          max_value: number | null
          metric: string | null
          min_value: number | null
          tenant_id: string | null
          total_records: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_trends: {
        Row: {
          data_points: number | null
          day: string | null
          max_value: number | null
          metric: string | null
          min_value: number | null
          tenant_id: string | null
          value: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      most_remixed_memories: {
        Row: {
          agent_name: string | null
          ai_feedback: string | null
          ai_rating: number | null
          context: string | null
          id: string | null
          is_user_submitted: boolean | null
          remix_count: number | null
          tenant_id: string | null
          timestamp: string | null
          type: string | null
          xp_delta: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_tenant_id"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      mql_kpi_delta: {
        Row: {
          delta: number | null
          kpi_name: string | null
          previous: number | null
          recent: number | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kpi_metrics_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      pg_policies: {
        Row: {
          command: string | null
          definition: string | null
          permissive: string | null
          policyname: unknown | null
          roles: unknown[] | null
          schemaname: unknown | null
          tablename: unknown | null
        }
        Relationships: []
      }
      rls_audit_view: {
        Row: {
          has_auth_policy: boolean | null
          has_tenant_id: boolean | null
          rls_enabled: boolean | null
          security_level: string | null
          table_name: string | null
        }
        Relationships: []
      }
      strategy_approval_stats: {
        Row: {
          ai_approved: number | null
          ai_percent: number | null
          human_approved: number | null
          tenant_id: string | null
          total_approved: number | null
        }
        Relationships: [
          {
            foreignKeyName: "strategies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategies_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_overview: {
        Row: {
          active_alerts: number | null
          avg_response_time: number | null
          critical_alerts: number | null
          error_rate: number | null
          high_alerts: number | null
          last_alert_time: string | null
          last_performance_log: string | null
          tenant_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      tables_without_rls: {
        Row: {
          table_name: unknown | null
        }
        Relationships: []
      }
      tenant_billing_summary: {
        Row: {
          billing_month: string | null
          tenant_id: string | null
          total_credits_used: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_usage_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_profiles_view: {
        Row: {
          created_at: string | null
          enable_auto_approve: boolean | null
          id: string | null
          isDemo: boolean | null
          name: string | null
          slack_webhook_url: string | null
          theme_color: string | null
          theme_mode: string | null
          updated_at: string | null
          usage_credits: number | null
        }
        Insert: {
          created_at?: string | null
          enable_auto_approve?: boolean | null
          id?: string | null
          isDemo?: boolean | null
          name?: string | null
          slack_webhook_url?: string | null
          theme_color?: string | null
          theme_mode?: string | null
          updated_at?: string | null
          usage_credits?: number | null
        }
        Update: {
          created_at?: string | null
          enable_auto_approve?: boolean | null
          id?: string | null
          isDemo?: boolean | null
          name?: string | null
          slack_webhook_url?: string | null
          theme_color?: string | null
          theme_mode?: string | null
          updated_at?: string | null
          usage_credits?: number | null
        }
        Relationships: []
      }
      weekly_agent_credit_usage: {
        Row: {
          agent_name: string | null
          module: string | null
          tenant_id: string | null
          total_credits: number | null
          week_start: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_usage_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_usage_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenant_profiles_view"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_billing_credits: {
        Args: { p_user_id: string; p_amount: number }
        Returns: undefined
      }
      check_plugin_permission: {
        Args: {
          _tenant_id: string
          _user_id: string
          _plugin_key: string
          _action: string
        }
        Returns: boolean
      }
      check_rls_status: {
        Args: { input_table_name: string }
        Returns: {
          table_name: string
          rls_enabled: boolean
        }[]
      }
      check_table_security_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          has_tenant_id: boolean
          has_auth_policy: boolean
        }[]
      }
      check_table_tenant_rls_status: {
        Args: { table_name: string }
        Returns: {
          has_rls: boolean
          has_tenant_id: boolean
          has_auth_policy: boolean
          policies: Json
        }[]
      }
      check_tenant_access: {
        Args: { requested_tenant_id: string }
        Returns: boolean
      }
      check_tenant_role_permission: {
        Args: { _user_id: string; _tenant_id: string }
        Returns: boolean
      }
      check_tenant_user_access: {
        Args: { tenant_uuid: string; user_uuid: string }
        Returns: boolean
      }
      check_tenant_user_access_safe: {
        Args: { tenant_uuid: string; user_uuid: string }
        Returns: boolean
      }
      check_tenant_user_role: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      count_strategy_approvals: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_approved: number
          ai_approved: number
          human_approved: number
        }[]
      }
      create_system_alert: {
        Args: {
          p_tenant_id: string
          p_alert_type: string
          p_severity: string
          p_message: string
          p_metadata?: Json
        }
        Returns: string
      }
      execute_sql: {
        Args: { sql_query: string }
        Returns: undefined
      }
      get_current_user_tenant_roles: {
        Args: { p_tenant_id: string }
        Returns: {
          tenant_id: string
          user_id: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_incomplete_rls_policies: {
        Args: Record<PropertyKey, never>
        Returns: {
          tablename: string
          policyname: string
        }[]
      }
      get_latest_weekly_summaries: {
        Args: { tenant_id_param: string; limit_param?: number }
        Returns: {
          id: string
          summary: string
          week_start: string
          generated_at: string
          metadata: Json
        }[]
      }
      get_plugin_earnings: {
        Args: Record<PropertyKey, never>
        Returns: {
          plugin_id: string
          plugin_name: string
          total_earned: number
          sales_count: number
        }[]
      }
      get_tables_without_rls: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          has_tenant_id: boolean
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role_for_tenant: {
        Args: { user_uuid: string; tenant_uuid: string }
        Returns: string
      }
      get_user_tenant_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_tenant_ids_safe: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      grant_billing_credits: {
        Args: { p_user_id: string; p_amount: number }
        Returns: undefined
      }
      has_role: {
        Args: { user_id: string; required_role: string }
        Returns: boolean
      }
      increment_remix_count: {
        Args: { memory_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_tenant_admin: {
        Args: { tenant_id: string } | { tenant_uuid: string; user_uuid: string }
        Returns: boolean
      }
      list_tables_with_rls_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
        }[]
      }
      log_automation_metric: {
        Args: { p_tenant_id: string; p_metric_name: string; p_is_ai: boolean }
        Returns: undefined
      }
      log_pipeline_event: {
        Args: {
          p_tenant_id: string
          p_event_type: string
          p_source: string
          p_target: string
          p_metadata?: Json
        }
        Returns: string
      }
      record_system_metric: {
        Args: {
          p_tenant_id: string
          p_metric_name: string
          p_value: number
          p_metadata?: Json
        }
        Returns: string
      }
      reset_billing_credits: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_agent_memory_score: {
        Args: { p_agent_id: string }
        Returns: number
      }
      update_subscription_status: {
        Args: {
          p_user_id: string
          p_status: string
          p_subscription_id: string
          p_end_date: string
        }
        Returns: undefined
      }
      use_billing_credits: {
        Args: { p_user_id: string; p_amount: number }
        Returns: boolean
      }
    }
    Enums: {
      plugin_status: "active" | "inactive" | "deprecated"
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
      plugin_status: ["active", "inactive", "deprecated"],
      user_role: ["admin", "editor", "viewer"],
    },
  },
} as const

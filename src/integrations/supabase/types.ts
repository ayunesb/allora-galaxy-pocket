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
          context: string
          id: string
          tenant_id: string
          timestamp: string | null
          type: string
          xp_delta: number | null
        }
        Insert: {
          agent_name: string
          context: string
          id?: string
          tenant_id: string
          timestamp?: string | null
          type: string
          xp_delta?: number | null
        }
        Update: {
          agent_name?: string
          context?: string
          id?: string
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
      billing_profiles: {
        Row: {
          created_at: string
          credits: number
          id: string
          plan: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          id?: string
          plan?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          id?: string
          plan?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          scripts: Json | null
          status: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          scripts?: Json | null
          status: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          scripts?: Json | null
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
          launch_mode: string | null
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
          launch_mode?: string | null
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
          launch_mode?: string | null
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
          github_repo_url: string | null
          id: string
          install_script: string | null
          installs: number | null
          is_public: boolean | null
          plugin_name: string
          recommended_by_agent: string | null
          remix_count: number | null
          schema_sql: string | null
          status: string | null
          submitted_at: string | null
          tenant_id: string
          webhook_secret: string | null
          zip_url: string | null
        }
        Insert: {
          description?: string | null
          github_repo_url?: string | null
          id?: string
          install_script?: string | null
          installs?: number | null
          is_public?: boolean | null
          plugin_name: string
          recommended_by_agent?: string | null
          remix_count?: number | null
          schema_sql?: string | null
          status?: string | null
          submitted_at?: string | null
          tenant_id: string
          webhook_secret?: string | null
          zip_url?: string | null
        }
        Update: {
          description?: string | null
          github_repo_url?: string | null
          id?: string
          install_script?: string | null
          installs?: number | null
          is_public?: boolean | null
          plugin_name?: string
          recommended_by_agent?: string | null
          remix_count?: number | null
          schema_sql?: string | null
          status?: string | null
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
      strategies: {
        Row: {
          created_at: string | null
          description: string | null
          diagnosis: Json | null
          failure_reason: string | null
          health_score: number | null
          id: string
          status: string | null
          tags: string[] | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          diagnosis?: Json | null
          failure_reason?: string | null
          health_score?: number | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          diagnosis?: Json | null
          failure_reason?: string | null
          health_score?: number | null
          id?: string
          status?: string | null
          tags?: string[] | null
          title?: string | null
          user_id?: string | null
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
          theme_color: string | null
          theme_mode: string | null
          updated_at: string | null
          usage_credits: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          name?: string | null
          theme_color?: string | null
          theme_mode?: string | null
          updated_at?: string | null
          usage_credits?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
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
        ]
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
      check_plugin_permission: {
        Args: {
          _tenant_id: string
          _user_id: string
          _plugin_key: string
          _action: string
        }
        Returns: boolean
      }
      check_tenant_role_permission: {
        Args: { _user_id: string; _tenant_id: string }
        Returns: boolean
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
      get_plugin_earnings: {
        Args: Record<PropertyKey, never>
        Returns: {
          plugin_id: string
          plugin_name: string
          total_earned: number
          sales_count: number
        }[]
      }
      get_user_role_for_tenant: {
        Args: { user_uuid: string; tenant_uuid: string }
        Returns: string
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
      update_agent_memory_score: {
        Args: { p_agent_id: string }
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

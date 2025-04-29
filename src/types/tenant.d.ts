
export interface Tenant {
  id: string;
  name?: string;
  enable_auto_approve?: boolean;
  is_demo?: boolean;
  usage_credits?: number;
  updated_at?: string;
  created_at?: string;
  theme_color?: string;
  theme_mode?: string;
  slack_webhook_url?: string;
}

export interface TenantAnalytics {
  id: string;
  tenant_id: string;
  tenant_name?: string;
  active_users: number;
  total_users?: number;
  total_strategies: number;
  total_campaigns?: number;
  total_credits_used?: number;
  mrr: number;
  max_users?: number;
  storage_limit?: number;
  analytics_enabled?: boolean;
  auto_approve_campaigns?: boolean;
  updated_at: string;
  created_at: string;
}

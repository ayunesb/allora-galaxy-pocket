
export interface Tenant {
  id: string;
  name: string;
  theme_mode: "light" | "system" | "dark";
  theme_color?: string;
  isDemo?: boolean;
  enable_auto_approve?: boolean;
  slack_webhook_url?: string;
  usage_credits?: number;
  created_at?: string;
  updated_at?: string;
}

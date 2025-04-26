
export interface Tenant {
  id: string;
  name: string;
  theme_mode: "light" | "dark" | "system";  // Required field
  theme_color?: string;
  enable_auto_approve?: boolean;
  isDemo?: boolean;
  role?: string;
  slack_webhook_url?: string;
  usage_credits?: number;
  created_at?: string;
  updated_at?: string;
  onboarding_completed?: boolean;
}

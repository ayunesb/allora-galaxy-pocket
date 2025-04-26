
export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  owner_id?: string;
  stripe_customer_id?: string;
  onboarding_completed?: boolean;
  features?: Record<string, boolean>;
  settings?: Record<string, any>;
  plan?: string;
  
  // Missing properties that are causing errors
  theme_color?: string;
  theme_mode?: "light" | "system" | "dark";
  isDemo?: boolean;
  enable_auto_approve?: boolean;
  slack_webhook_url?: string;
  usage_credits?: number;
}

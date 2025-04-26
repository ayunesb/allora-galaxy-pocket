
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
}

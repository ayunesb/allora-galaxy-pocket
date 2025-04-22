
export interface BillingProfile {
  id: string;
  user_id: string;
  plan: 'standard' | 'growth' | 'pro';
  credits: number;
  created_at: string;
  updated_at: string;
}

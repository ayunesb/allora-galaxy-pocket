
export interface BillingProfile {
  id: string;
  user_id: string;
  plan: 'standard' | 'growth' | 'pro';
  credits: number;
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;  // Add this line
  stripe_subscription_item_id?: string;  // Also add this for completeness
}

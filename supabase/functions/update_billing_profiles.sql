
-- Add stripe_subscription_item_id column to billing_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'billing_profiles' 
    AND column_name = 'stripe_subscription_item_id'
  ) THEN
    ALTER TABLE public.billing_profiles 
    ADD COLUMN stripe_subscription_item_id text;
  END IF;
END
$$;

-- Create tenant_invoice_data view for detailed invoice generation
CREATE OR REPLACE VIEW public.tenant_invoice_data AS
SELECT
  tenant_id,
  date_trunc('month', created_at) as billing_month,
  agent_name,
  module,
  'usage' as action,
  sum(credits_used) as credits,
  min(created_at) as start_date,
  max(created_at) as end_date
FROM public.credit_usage_log
GROUP BY tenant_id, date_trunc('month', created_at), agent_name, module
ORDER BY billing_month DESC;

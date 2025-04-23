
-- Function to get available billing months for a tenant
CREATE OR REPLACE FUNCTION public.get_tenant_billing_months(p_tenant_id uuid)
RETURNS SETOF timestamp with time zone
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DISTINCT date_trunc('month', created_at) as billing_month
  FROM credit_usage_log
  WHERE tenant_id = p_tenant_id
  ORDER BY billing_month DESC;
$$;

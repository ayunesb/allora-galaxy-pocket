
-- Function to resolve a KPI alert safely (handles both kpi_alerts and kpi_insights)
CREATE OR REPLACE FUNCTION public.resolve_kpi_alert(
  alert_id UUID,
  resolution_note TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_alert_exists BOOLEAN;
  v_insight_exists BOOLEAN;
BEGIN
  -- Check if this is a kpi_alert
  SELECT 
    EXISTS (
      SELECT 1 FROM kpi_alerts WHERE id = alert_id AND tenant_id IN (SELECT tenant_id FROM tenant_user_roles WHERE user_id = auth.uid())
    ),
    (SELECT tenant_id FROM kpi_alerts WHERE id = alert_id)
  INTO v_alert_exists, v_tenant_id;

  IF v_alert_exists THEN
    -- Update kpi_alert
    UPDATE kpi_alerts
    SET 
      status = 'resolved',
      message = resolution_note
    WHERE id = alert_id AND tenant_id = v_tenant_id;
    
    RETURN TRUE;
  END IF;

  -- Check if this is a kpi_insight
  SELECT 
    EXISTS (
      SELECT 1 FROM kpi_insights WHERE id = alert_id AND tenant_id IN (SELECT tenant_id FROM tenant_user_roles WHERE user_id = auth.uid())
    ),
    (SELECT tenant_id FROM kpi_insights WHERE id = alert_id)
  INTO v_insight_exists, v_tenant_id;
  
  IF v_insight_exists THEN
    -- Update kpi_insight
    UPDATE kpi_insights
    SET 
      outcome = 'resolved',
      suggested_action = resolution_note
    WHERE id = alert_id AND tenant_id = v_tenant_id;
    
    RETURN TRUE;
  END IF;

  -- If we get here, the alert doesn't exist or user doesn't have access
  RETURN FALSE;
END;
$$;

-- Replace recursive RLS policies with secure versions using security definer functions

-- First, create better security definer functions to avoid RLS recursion
-- Function to get user's tenant IDs safely
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids_safe()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
    SELECT tenant_id FROM tenant_user_roles
    WHERE user_id = auth.uid();
END;
$$;

-- Function to check tenant-user access safely
CREATE OR REPLACE FUNCTION public.check_tenant_user_access_safe(tenant_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_user_roles 
    WHERE tenant_id = tenant_uuid AND user_id = user_uuid
  );
END;
$$;

-- Function to get user's role in a tenant safely
CREATE OR REPLACE FUNCTION public.get_user_role_for_tenant_safe(tenant_uuid uuid, user_uuid uuid)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role
  FROM tenant_user_roles
  WHERE tenant_id = tenant_uuid
  AND user_id = user_uuid
  LIMIT 1;
  
  RETURN COALESCE(v_role, 'viewer');
END;
$$;

-- Update RLS policies for tenant_user_roles to avoid recursion
ALTER TABLE IF EXISTS tenant_user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view roles in their tenants" ON tenant_user_roles;
CREATE POLICY "Users can view roles in their tenants" 
ON tenant_user_roles
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

DROP POLICY IF EXISTS "Tenant admins can insert roles" ON tenant_user_roles;
CREATE POLICY "Tenant admins can insert roles" 
ON tenant_user_roles
FOR INSERT 
WITH CHECK (
  get_user_role_for_tenant_safe(tenant_id, auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Tenant admins can update roles" ON tenant_user_roles;
CREATE POLICY "Tenant admins can update roles" 
ON tenant_user_roles
FOR UPDATE
USING (
  get_user_role_for_tenant_safe(tenant_id, auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Tenant admins can delete roles" ON tenant_user_roles;
CREATE POLICY "Tenant admins can delete roles" 
ON tenant_user_roles
FOR DELETE
USING (
  get_user_role_for_tenant_safe(tenant_id, auth.uid()) = 'admin'
);

-- Make sure all KPI tables have proper RLS policies
ALTER TABLE IF EXISTS kpi_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their tenant's KPI alerts" ON kpi_alerts;
CREATE POLICY "Users can view their tenant's KPI alerts" 
ON kpi_alerts
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

DROP POLICY IF EXISTS "Users can update their tenant's KPI alerts" ON kpi_alerts;
CREATE POLICY "Users can update their tenant's KPI alerts" 
ON kpi_alerts
FOR UPDATE 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Do the same for kpi_insights
ALTER TABLE IF EXISTS kpi_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their tenant's KPI insights" ON kpi_insights;
CREATE POLICY "Users can view their tenant's KPI insights" 
ON kpi_insights
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

DROP POLICY IF EXISTS "Users can update their tenant's KPI insights" ON kpi_insights;
CREATE POLICY "Users can update their tenant's KPI insights" 
ON kpi_insights
FOR UPDATE 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Make sure all critical tables have proper RLS
ALTER TABLE IF EXISTS strategies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their tenant's strategies" ON strategies;
CREATE POLICY "Users can view their tenant's strategies" 
ON strategies
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Make sure agents tables have proper RLS
ALTER TABLE IF EXISTS agent_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their tenant's agents" ON agent_profiles;
CREATE POLICY "Users can view their tenant's agents" 
ON agent_profiles
FOR SELECT 
USING (tenant_id IN (SELECT * FROM get_user_tenant_ids_safe()));

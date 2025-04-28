
-- Step 1: Create Security Definer Functions to Fix RLS Recursion Issues

-- Function to get user's tenant IDs safely
CREATE OR REPLACE FUNCTION public.get_user_tenant_ids_safe()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
    SELECT tenant_id FROM tenant_user_roles
    WHERE user_id = auth.uid();
END;
$function$;

-- Function to check tenant-user access safely
CREATE OR REPLACE FUNCTION public.check_tenant_user_access_safe(tenant_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenant_user_roles 
    WHERE tenant_id = tenant_uuid AND user_id = user_uuid
  );
END;
$function$;

-- Function to get user's role in a tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant_role(
  p_tenant_id uuid,
  p_user_id uuid
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role::TEXT INTO v_role
  FROM tenant_user_roles
  WHERE tenant_id = p_tenant_id
  AND user_id = p_user_id
  LIMIT 1;
  
  RETURN COALESCE(v_role, 'viewer');
END;
$$;

-- Step 2: Update RLS Policies to Use Security Definer Functions

-- Example policy to update
-- DROP POLICY IF EXISTS "Users can view their tenant data" ON tenant_profiles;
-- CREATE POLICY "Users can view their tenant data" ON tenant_profiles
--   FOR SELECT 
--   USING (id IN (SELECT * FROM get_user_tenant_ids_safe()));

-- Ensure RLS is enabled on major tables
ALTER TABLE IF EXISTS tenant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agent_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS agent_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS kpi_metrics ENABLE ROW LEVEL SECURITY;


-- Function to get a user's role in a tenant safely without causing recursion
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

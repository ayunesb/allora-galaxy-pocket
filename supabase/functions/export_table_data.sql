
-- Function to safely export table data with tenant isolation
CREATE OR REPLACE FUNCTION public.export_table_data(p_table_name text, p_tenant_id uuid)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  has_tenant_id boolean;
  query text;
  user_role text;
BEGIN
  -- Check if user has admin role
  SELECT role INTO user_role FROM tenant_user_roles
  WHERE tenant_id = p_tenant_id AND user_id = auth.uid() LIMIT 1;

  IF user_role != 'admin' THEN
    RAISE EXCEPTION 'Export requires admin privileges';
  END IF;
  
  -- Check if table exists
  PERFORM check_table_exists(p_table_name);
  
  -- Check if table has tenant_id column
  SELECT EXISTS (
    SELECT FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = p_table_name
    AND column_name = 'tenant_id'
  ) INTO has_tenant_id;
  
  -- Build and execute query with proper tenant isolation
  IF has_tenant_id THEN
    query := format('SELECT row_to_json(t) FROM (SELECT * FROM %I WHERE tenant_id = %L) t', 
                    p_table_name, p_tenant_id);
  ELSE
    -- For tables without tenant_id, only allow specific tables like subscription_tiers
    IF p_table_name IN ('subscription_tiers') THEN
      query := format('SELECT row_to_json(t) FROM (SELECT * FROM %I) t', p_table_name);
    ELSE
      RAISE EXCEPTION 'Cannot export table % without tenant_id column', p_table_name;
    END IF;
  END IF;
  
  -- Log the export for audit purposes
  INSERT INTO system_logs (tenant_id, user_id, event_type, message)
  VALUES (p_tenant_id, auth.uid(), 'DATA_EXPORT', 'Exported data from table: ' || p_table_name);
  
  RETURN QUERY EXECUTE query;
END;
$$;


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client using environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract request parameters
    const { checkType = 'all' } = await req.json();

    let result = {};

    // 1. Check for tables without RLS enabled
    if (checkType === 'all' || checkType === 'rls') {
      const { data: tablesWithoutRLS, error: rlsError } = await supabase
        .rpc("get_tables_without_rls");

      if (rlsError) throw rlsError;
      result = { ...result, tablesWithoutRLS: tablesWithoutRLS || [] };
    }

    // 2. Check for incomplete RLS policies (missing auth.uid references)
    if (checkType === 'all' || checkType === 'policies') {
      const { data: incompleteRLSPolicies, error: policiesError } = await supabase
        .rpc("get_incomplete_rls_policies");

      if (policiesError) throw policiesError;
      result = { ...result, incompleteRLSPolicies: incompleteRLSPolicies || [] };
    }

    // 3. Check for security definer views
    if (checkType === 'all' || checkType === 'views') {
      const { data: securityDefinerViews, error: viewError } = await supabase
        .from('pg_views')
        .select('viewname, schemaname, definition')
        .eq('schemaname', 'public')
        .ilike('definition', '%security definer%');

      if (viewError) throw viewError;
      result = { ...result, securityDefinerViews: securityDefinerViews || [] };
    }

    // 4. Check for tables without tenant_id column that should have one
    if (checkType === 'all' || checkType === 'tenantId') {
      const { data: publicTables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .neq('table_name', 'pg_stat_statements')
        .neq('table_name', 'pg_stat_statements_info');

      if (tableError) throw tableError;

      // For each public table, check if it has a tenant_id column
      const tablesWithoutTenantId = [];
      for (const tableObj of publicTables || []) {
        const tableName = tableObj.table_name;
        
        // Skip certain system tables
        if (tableName.startsWith('pg_') || 
            tableName === 'schema_migrations' || 
            tableName === 'spatial_ref_sys') {
          continue;
        }
        
        const { data: columns, error: columnError } = await supabase
          .from('information_schema.columns')
          .select('column_name')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .eq('column_name', 'tenant_id');
          
        if (columnError) {
          console.error(`Error checking columns for ${tableName}:`, columnError);
          continue;
        }
        
        if (!columns || columns.length === 0) {
          tablesWithoutTenantId.push({
            table_name: tableName,
            recommendation: "Consider adding tenant_id column for better multi-tenancy"
          });
        }
      }

      result = { ...result, tablesWithoutTenantId };
    }

    // 5. Identify critical security issues
    if (checkType === 'all') {
      const criticalIssues = [];

      // Process tables without RLS
      if (result.tablesWithoutRLS) {
        for (const table of result.tablesWithoutRLS) {
          criticalIssues.push({
            type: "rls_disabled",
            table: table.table_name,
            severity: "high",
            description: `The table "${table.table_name}" does not have Row Level Security enabled`,
            recommendation: `Enable RLS with: ALTER TABLE public.${table.table_name} ENABLE ROW LEVEL SECURITY;`
          });
        }
      }

      // Process incomplete policies
      if (result.incompleteRLSPolicies) {
        for (const policy of result.incompleteRLSPolicies) {
          criticalIssues.push({
            type: "incomplete_policy",
            table: policy.tablename,
            policy: policy.policyname,
            severity: "medium",
            description: `Policy "${policy.policyname}" on table "${policy.tablename}" lacks proper auth.uid() or tenant_id references`,
            recommendation: `Update the policy to include proper auth.uid() and tenant_id checks`
          });
        }
      }

      // Process security definer views
      if (result.securityDefinerViews) {
        for (const view of result.securityDefinerViews) {
          criticalIssues.push({
            type: "security_definer",
            view: view.viewname,
            severity: "medium",
            description: `View "${view.viewname}" uses SECURITY DEFINER which can be a security risk if not carefully implemented`,
            recommendation: `Review the SECURITY DEFINER implementation in the view or consider using SECURITY INVOKER instead`
          });
        }
      }

      result = { ...result, criticalIssues };
    }

    // Log that the security audit was run
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: req.headers.get('x-tenant-id') || '00000000-0000-0000-0000-000000000000',
        user_id: req.headers.get('x-user-id') || null,
        event_type: 'SECURITY_AUDIT_RUN',
        message: 'Security audit was executed',
        meta: { 
          issues_found: {
            tables_without_rls: result.tablesWithoutRLS?.length || 0,
            incomplete_policies: result.incompleteRLSPolicies?.length || 0,
            security_definer_views: result.securityDefinerViews?.length || 0,
            tables_without_tenant_id: result.tablesWithoutTenantId?.length || 0
          }
        }
      });

    // Add timestamp
    result = {
      ...result,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in security audit:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

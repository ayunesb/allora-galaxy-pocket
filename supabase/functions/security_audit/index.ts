
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { validateAllTables, checkTableRlsStatus } from "../_shared/rls-validator.ts";

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

    // 1. Check for tables without RLS enabled
    const { data: tablesWithoutRLS, error: rlsError } = await supabase
      .rpc("get_tables_without_rls");

    if (rlsError) throw rlsError;

    // 2. Check for incomplete RLS policies (missing auth.uid references)
    const { data: incompleteRLSPolicies, error: policiesError } = await supabase
      .rpc("get_incomplete_rls_policies");

    if (policiesError) throw policiesError;

    // 3. Check for security definer views
    const { data: securityDefinerViews, error: viewError } = await supabase
      .from('pg_views')
      .select('viewname, schemaname, definition')
      .eq('schemaname', 'public')
      .ilike('definition', '%security definer%');

    if (viewError) throw viewError;

    // 4. Check for tables without tenant_id column that should have one
    const { data: publicTables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'pg_stat_statements')
      .neq('table_name', 'pg_stat_statements_info');

    if (tableError) throw tableError;

    // For each public table, check if it has a tenant_id column
    const tablesWithoutTenantId = [];
    for (const tableObj of publicTables) {
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

    // 5. Run complete RLS validator on all tables
    const allTableResults = await validateAllTables();

    // 6. Identify critical security issues
    const criticalIssues = [];

    // Tables without RLS
    for (const table of tablesWithoutRLS || []) {
      criticalIssues.push({
        type: "rls_disabled",
        table: table.table_name,
        severity: "high",
        description: `The table "${table.table_name}" does not have Row Level Security enabled`,
        recommendation: `Enable RLS with: ALTER TABLE public.${table.table_name} ENABLE ROW LEVEL SECURITY;`
      });
    }

    // Tables with incomplete policies
    for (const policy of incompleteRLSPolicies || []) {
      criticalIssues.push({
        type: "incomplete_policy",
        table: policy.tablename,
        policy: policy.policyname,
        severity: "medium",
        description: `Policy "${policy.policyname}" on table "${policy.tablename}" lacks proper auth.uid() or tenant_id references`,
        recommendation: `Update the policy to include proper auth.uid() and tenant_id checks`
      });
    }

    // Security definer views (potential security risk)
    for (const view of securityDefinerViews || []) {
      criticalIssues.push({
        type: "security_definer",
        view: view.viewname,
        severity: "medium",
        description: `View "${view.viewname}" uses SECURITY DEFINER which can be a security risk if not carefully implemented`,
        recommendation: `Review the SECURITY DEFINER implementation in the view or consider using SECURITY INVOKER instead`
      });
    }

    // Consolidate all security issues
    const securityAuditResults = {
      tablesWithoutRLS: tablesWithoutRLS || [],
      incompleteRLSPolicies: incompleteRLSPolicies || [],
      securityDefinerViews: securityDefinerViews || [],
      tablesWithoutTenantId: tablesWithoutTenantId,
      tableAnalysis: allTableResults,
      criticalIssues,
      timestamp: new Date().toISOString(),
    };

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
            tables_without_rls: tablesWithoutRLS?.length || 0,
            incomplete_policies: incompleteRLSPolicies?.length || 0,
            security_definer_views: securityDefinerViews?.length || 0,
            tables_without_tenant_id: tablesWithoutTenantId.length || 0
          }
        }
      });

    return new Response(
      JSON.stringify(securityAuditResults),
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

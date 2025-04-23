
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // 1. Check for security definer views
    const { data: securityDefinerViews, error: viewError } = await supabase
      .from('pg_catalog.pg_views')
      .select('viewname, schemaname, definition')
      .eq('schemaname', 'public')
      .ilike('definition', '%security definer%');

    if (viewError) throw viewError;

    // 2. Check for tables without RLS enabled
    const { data: tablesWithoutRLS, error: rlsError } = await supabase
      .rpc("get_tables_without_rls");

    if (rlsError) throw rlsError;

    // 3. Check for incomplete RLS policies (missing auth.uid references)
    const { data: incompleteRLSPolicies, error: policiesError } = await supabase
      .rpc("get_incomplete_rls_policies");

    if (policiesError) throw policiesError;

    // Consolidate all security issues
    const securityIssues = {
      securityDefinerViews: securityDefinerViews || [],
      tablesWithoutRLS: tablesWithoutRLS || [],
      incompleteRLSPolicies: incompleteRLSPolicies || [],
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(securityIssues),
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

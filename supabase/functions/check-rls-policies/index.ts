
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

    // Query to get tables without RLS enabled
    const { data: tables, error: tablesError } = await supabase
      .rpc("get_tables_without_rls");

    if (tablesError) throw tablesError;

    const unprotectedTables = tables || [];

    // Query to get tables with incomplete RLS policies
    const { data: incompletePolicies, error: policiesError } = await supabase
      .rpc("get_incomplete_rls_policies");
      
    if (policiesError) throw policiesError;

    return new Response(
      JSON.stringify({
        unprotectedTables,
        incompletePolicies: incompletePolicies || [],
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

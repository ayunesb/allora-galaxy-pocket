
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data: tenants, error: fetchError } = await supabase
      .from("tenant_profiles")
      .select("id, usage_credits");

    if (fetchError) {
      console.error("[Billing] Failed to fetch tenants:", fetchError.message);
      return new Response(JSON.stringify({ error: fetchError.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results = [];

    for (const tenant of tenants) {
      const updatedCredits = Math.max((tenant.usage_credits || 0) - 1, 0);

      const { error: updateError } = await supabase
        .from("tenant_profiles")
        .update({ usage_credits: updatedCredits })
        .eq("id", tenant.id);

      results.push({
        tenant_id: tenant.id,
        before: tenant.usage_credits,
        after: updatedCredits,
        status: updateError ? "error" : "success",
        message: updateError?.message || "OK"
      });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    });
  } catch (error) {
    console.error("[Billing] Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Unexpected server error" }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

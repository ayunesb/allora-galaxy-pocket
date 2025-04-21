
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenant_profiles')
      .select('id');

    if (tenantsError) throw tenantsError;

    console.log(`Found ${tenants.length} tenants to generate strategies for`);

    for (const tenant of tenants) {
      const strategy = {
        tenant_id: tenant.id,
        title: "Weekly AI Strategy",
        description: "Automated strategy generated for your business",
        created_at: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('vault_strategies')
        .insert(strategy);

      if (insertError) {
        console.error(`Error creating strategy for tenant ${tenant.id}:`, insertError);
      } else {
        console.log(`Created strategy for tenant ${tenant.id}`);
      }
    }

    return new Response(
      JSON.stringify({ status: '🧠 Strategies generated successfully' }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate strategies' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})

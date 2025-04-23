
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get tenants with MQL drops
    const { data: tenants, error: deltaError } = await supabase
      .from('mql_kpi_delta')
      .select('*')

    if (deltaError) throw deltaError;

    for (const tenant of tenants || []) {
      if (tenant.delta < -5) { // Significant drop threshold
        // Generate recovery strategy using OpenAI
        const prompt = `MQLs dropped by ${Math.abs(tenant.delta)}. Generate an AI recovery strategy using WhatsApp, email, and lead magnets.`;
        
        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          }),
        });

        if (!aiRes.ok) {
          throw new Error('Failed to generate strategy');
        }

        const result = await aiRes.json();
        const strategy = result.choices[0].message.content;

        // Insert new strategy
        const { data: strategyData, error: strategyError } = await supabase
          .from('strategies')
          .insert({
            tenant_id: tenant.tenant_id,
            title: 'MQL Recovery Plan',
            description: strategy,
            status: 'pending_approval',
            generated_by: 'CEO Agent',
            assigned_agent: 'GrowthAgent'
          })
          .select()
          .single();

        if (strategyError) throw strategyError;

        // Send Slack notification if webhook URL exists
        const { data: tenantData } = await supabase
          .from('tenant_plugins')
          .select('*')
          .eq('tenant_id', tenant.tenant_id)
          .eq('plugin_key', 'slack')
          .single();

        if (tenantData?.enabled) {
          await supabase.functions.invoke('send-webhook-notification', {
            body: {
              message: `🚨 MQLs dropped by ${Math.abs(tenant.delta)}. A new recovery strategy has been generated and is ready for review.`,
              type: 'strategy_alert',
              channel: 'slack'
            }
          });
        }

        console.log(`Recovery strategy created for tenant ${tenant.tenant_id}`);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Strategy adjustments processed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in strategy-adjustments function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

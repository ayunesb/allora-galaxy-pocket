
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { strategy_id, tenant_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get tenant settings
    const { data: tenant } = await supabase
      .from('tenant_profiles')
      .select('enable_auto_approve, slack_webhook_url')
      .eq('id', tenant_id)
      .single();

    if (!tenant?.enable_auto_approve) {
      return new Response(
        JSON.stringify({ message: 'Auto-approval disabled for this tenant' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check MQL drop
    const { data: mqlMetrics } = await supabase
      .from('mql_kpi_delta')
      .select('delta')
      .eq('tenant_id', tenant_id)
      .eq('kpi_name', 'mql')
      .single();

    const mqlDrop = Math.abs(Number(mqlMetrics?.delta || 0));

    // Get agent feedback
    const { data: feedback } = await supabase
      .from('agent_feedback')
      .select('rating')
      .eq('task_id', strategy_id);

    const avgScore = feedback?.length 
      ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length 
      : 0;

    // Auto-approve if conditions are met
    if (mqlDrop > 20 || avgScore >= 4.5) {
      const { error: updateError } = await supabase
        .from('strategies')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          auto_approved: true
        })
        .eq('id', strategy_id);

      if (updateError) throw updateError;

      // Notify via Slack if webhook URL is configured
      if (tenant.slack_webhook_url) {
        const { data: strategy } = await supabase
          .from('strategies')
          .select('title')
          .eq('id', strategy_id)
          .single();

        await fetch(tenant.slack_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `✅ Strategy auto-approved by AI\nTitle: ${strategy?.title}\nTrigger: ${
              mqlDrop > 20 ? `MQL drop of ${mqlDrop}%` : `Agent feedback score: ${avgScore}`
            }`
          })
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Strategy auto-approved',
          trigger: mqlDrop > 20 ? 'mql_drop' : 'agent_feedback'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Auto-approval conditions not met' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-approve-strategy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

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
    const { campaignId, outcomes, tenantId } = await req.json();

    if (!campaignId || !outcomes || !tenantId) {
      throw new Error('Missing required parameters: campaignId, outcomes, or tenantId');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Verify campaign exists and belongs to tenant
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, name, status')
      .eq('id', campaignId)
      .eq('tenant_id', tenantId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campaign not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert outcomes into campaign_outcomes table
    const outcomeRecords = Object.entries(outcomes).map(([key, value]) => ({
      tenant_id: tenantId,
      campaign_id: campaignId,
      outcome_type: key,
      outcome_value: typeof value === 'object' ? JSON.stringify(value) : value,
      details: typeof value === 'object' ? value : null
    }));

    const { error: insertError } = await supabase
      .from('campaign_outcomes')
      .insert(outcomeRecords);

    if (insertError) {
      throw insertError;
    }

    // Log to system_logs for audit trail
    await supabase.from('system_logs').insert({
      tenant_id: tenantId,
      event_type: 'CAMPAIGN_OUTCOMES_TRACKED',
      message: `Campaign outcomes tracked for campaign: ${campaign.name}`,
      meta: { campaignId, outcomeCount: outcomeRecords.length }
    });

    // Update campaign metrics summary
    const { data: existingMetrics } = await supabase
      .from('campaigns')
      .select('execution_metrics')
      .eq('id', campaignId)
      .single();

    const updatedMetrics = {
      ...(existingMetrics?.execution_metrics || {}),
      outcomes: outcomes,
      last_tracked: new Date().toISOString()
    };

    await supabase
      .from('campaigns')
      .update({ 
        execution_metrics: updatedMetrics,
        execution_status: 'completed'
      })
      .eq('id', campaignId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Campaign outcomes tracked successfully',
        updatedMetrics
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error tracking campaign outcomes:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

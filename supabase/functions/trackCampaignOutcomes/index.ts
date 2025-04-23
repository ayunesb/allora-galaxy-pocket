
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const supabase = createClient(
      'https://lxsuqqlfuftnvuvtctsx.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('Starting campaign outcome tracking...');

    // 1. Get all KPI insights with campaigns still marked as 'pending'
    const { data: insights, error: insightsError } = await supabase
      .from('kpi_insights')
      .select('id, campaign_id, tenant_id, kpi_name, target')
      .eq('outcome', 'pending')
      .not('campaign_id', 'is', null);

    if (insightsError) {
      console.error('Error fetching insights:', insightsError);
      throw insightsError;
    }

    if (!insights?.length) {
      console.log('No pending insights to evaluate');
      return new Response('No insights to evaluate', { headers: corsHeaders });
    }

    console.log(`Found ${insights.length} pending insights to evaluate`);

    for (const insight of insights) {
      try {
        // 2. Get the latest value for this KPI
        const { data: metric, error: metricError } = await supabase
          .from('kpi_metrics')
          .select('value')
          .eq('tenant_id', insight.tenant_id)
          .eq('metric', insight.kpi_name)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();

        if (metricError) {
          console.error(`Error fetching metric for insight ${insight.id}:`, metricError);
          continue;
        }

        if (!metric) {
          console.log(`No metric found for insight ${insight.id}, skipping...`);
          continue;
        }

        const success = insight.target && metric.value >= insight.target;
        console.log(`Insight ${insight.id} evaluation: Target=${insight.target}, Current=${metric.value}, Success=${success}`);

        // 3. Update outcome based on result
        const { error: updateError } = await supabase
          .from('kpi_insights')
          .update({ outcome: success ? 'success' : 'failed' })
          .eq('id', insight.id);

        if (updateError) {
          console.error(`Error updating insight ${insight.id}:`, updateError);
          continue;
        }

        console.log(`Successfully updated insight ${insight.id} outcome to ${success ? 'success' : 'failed'}`);
      } catch (insightError) {
        console.error(`Error processing insight ${insight.id}:`, insightError);
        continue;
      }
    }

    return new Response('KPI campaign outcomes tracked successfully', {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in trackCampaignOutcomes function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

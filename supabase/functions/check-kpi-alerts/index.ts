
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
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );

    console.log('Starting KPI alert check...');

    // Get tenant parameter from request if available
    let tenantId: string | null = null;
    try {
      const body = await req.json();
      tenantId = body?.tenant_id;
    } catch {
      // No body or invalid JSON, continue with all tenants
    }

    // 1. Get all active KPI insights with campaigns and their targets
    let kpiQuery = supabase
      .from('kpi_insights')
      .select(`
        id, 
        kpi_name,
        tenant_id,
        campaign_id,
        target,
        outcome
      `)
      .eq('outcome', 'pending')
      .not('campaign_id', 'is', null)
      .not('target', 'is', null);
    
    // Filter by tenant if provided
    if (tenantId) {
      kpiQuery = kpiQuery.eq('tenant_id', tenantId);
    }

    const { data: insights, error: insightsError } = await kpiQuery;

    if (insightsError) {
      console.error('Error fetching insights:', insightsError);
      throw insightsError;
    }

    console.log(`Found ${insights?.length || 0} KPI insights to check`);
    
    if (!insights || insights.length === 0) {
      return new Response(JSON.stringify({ message: 'No insights to check' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Process each insight
    const promises = insights.map(async (insight) => {
      try {
        // Get latest metric value for this KPI
        const { data: latestMetric, error: metricError } = await supabase
          .from('kpi_metrics')
          .select('value')
          .eq('tenant_id', insight.tenant_id)
          .eq('metric', insight.kpi_name)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .single();

        if (metricError) {
          console.error(`Error fetching metric for insight ${insight.id}:`, metricError);
          return null;
        }

        if (!latestMetric) {
          console.log(`No metric found for insight ${insight.id}, skipping...`);
          return null;
        }

        // Evaluate if target is met
        const targetMet = latestMetric.value >= insight.target!;
        console.log(`Insight ${insight.id} evaluation: Target=${insight.target}, Current=${latestMetric.value}, Success=${targetMet}`);

        // Update outcome based on evaluation
        const { error: updateError } = await supabase
          .from('kpi_insights')
          .update({ 
            outcome: targetMet ? 'success' : 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', insight.id);

        if (updateError) {
          console.error(`Error updating insight ${insight.id}:`, updateError);
          return null;
        }

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            tenant_id: insight.tenant_id,
            event_type: targetMet ? 'kpi_target_achieved' : 'kpi_target_missed',
            description: targetMet 
              ? `Campaign KPI "${insight.kpi_name}" has achieved its target of ${insight.target}`
              : `Campaign KPI "${insight.kpi_name}" has missed its target of ${insight.target}`
          });

        // Update campaign status if needed
        if (targetMet) {
          const { error: campaignError } = await supabase
            .from('campaigns')
            .update({ status: 'completed' })
            .eq('id', insight.campaign_id);
            
          if (campaignError) {
            console.error(`Error updating campaign ${insight.campaign_id}:`, campaignError);
          }
        }

        return {
          insight_id: insight.id,
          success: true,
          target_met: targetMet
        };
      } catch (error) {
        console.error(`Error processing insight ${insight.id}:`, error);
        return {
          insight_id: insight.id,
          success: false,
          error: error.message
        };
      }
    });

    const results = await Promise.all(promises);

    // Log execution
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'check-kpi-alerts',
        status: 'success',
        message: `Processed ${insights.length} KPI insights`
      });

    return new Response(JSON.stringify({ 
      success: true, 
      processed: insights.length,
      results 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in check-kpi-alerts function:', error);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'check-kpi-alerts',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

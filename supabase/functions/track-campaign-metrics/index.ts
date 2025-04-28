
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface CampaignMetricsPayload {
  campaign_id: string;
  tenant_id: string;
  metric_type: 'view' | 'click' | 'conversion';
  value?: number;
  metadata?: Record<string, any>;
}

serve(async (req: Request) => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    // Create Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse the request body
    const payload: CampaignMetricsPayload = await req.json();
    const { campaign_id, tenant_id, metric_type, value = 1, metadata = {} } = payload;
    
    if (!campaign_id || !tenant_id || !metric_type) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: campaign_id, tenant_id, or metric_type' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Fetch the current campaign to get execution metrics
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('execution_metrics')
      .eq('id', campaign_id)
      .eq('tenant_id', tenant_id)
      .single();
      
    if (fetchError) {
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Update the metrics
    const currentMetrics = campaign?.execution_metrics || {};
    const updatedMetrics = {
      ...currentMetrics,
      [metric_type + 's']: (currentMetrics[metric_type + 's'] || 0) + value,
      last_tracked: new Date().toISOString()
    };
    
    // Update the campaign in the database
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({
        execution_metrics: updatedMetrics,
        last_metrics_update: new Date().toISOString()
      })
      .eq('id', campaign_id)
      .eq('tenant_id', tenant_id);
      
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Log the tracking event
    await supabase.from('system_logs').insert({
      tenant_id,
      event_type: 'CAMPAIGN_METRIC_TRACKED',
      message: `Campaign ${metric_type} metric tracked`,
      meta: {
        campaign_id,
        metric_type,
        value,
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
    
    return new Response(JSON.stringify({ 
      success: true,
      message: `Campaign ${metric_type} metric tracked successfully`,
      new_total: updatedMetrics[metric_type + 's'] || value
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

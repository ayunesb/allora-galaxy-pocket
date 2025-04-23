
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // If this is a scheduled invocation, process all tenants
    // Process all tenants
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenant_profiles')
      .select('id');

    if (tenantsError) {
      throw new Error('Failed to fetch tenants: ' + tenantsError.message);
    }

    const results = [];
    
    for (const tenant of tenants || []) {
      try {
        const result = await processKpiTrends(supabase, tenant.id);
        results.push(result);
      } catch (tenantError) {
        console.error(`Error processing KPI trends for tenant ${tenant.id}:`, tenantError);
        
        // Log failure for this tenant
        await supabase
          .from('cron_job_logs')
          .insert({
            function_name: 'fetch-kpi-trend',
            status: 'error',
            message: `Error processing tenant ${tenant.id}: ${tenantError.message}`
          });
      }
    }

    // Log overall success
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'fetch-kpi-trend',
        status: 'success',
        message: `Processed KPI trends for ${results.length} tenants successfully`
      });

    return new Response(
      JSON.stringify({ success: true, processed: results.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('KPI Trend Analysis Error:', error);
    
    // Log the overall function failure
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'fetch-kpi-trend',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    // Try to send Slack alert if configured
    try {
      await sendSlackAlert('fetch-kpi-trend', error.message);
    } catch (slackError) {
      console.error('Failed to send Slack alert:', slackError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function processKpiTrends(supabase, tenant_id: string) {
  // Get KPI metrics from the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: kpiData, error: kpiError } = await supabase
    .from('kpi_metrics')
    .select('*')
    .eq('tenant_id', tenant_id)
    .gte('recorded_at', thirtyDaysAgo.toISOString())
    .order('recorded_at', { ascending: false });

  if (kpiError) {
    throw new Error(`Failed to fetch KPI metrics: ${kpiError.message}`);
  }

  if (!kpiData || kpiData.length === 0) {
    console.log(`No KPI metrics found for tenant ${tenant_id}`);
    return { tenant_id, metrics_analyzed: 0, trends_detected: 0 };
  }

  // Group metrics by metric name
  const metricsByName = kpiData.reduce((acc, metric) => {
    if (!acc[metric.metric]) {
      acc[metric.metric] = [];
    }
    acc[metric.metric].push(metric);
    return acc;
  }, {});

  // Calculate trends for each metric
  const trends = [];
  let trendsDetected = 0;

  for (const [metricName, metrics] of Object.entries(metricsByName)) {
    // Sort by date ascending to analyze trend properly
    const sortedMetrics = metrics.sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
    
    if (sortedMetrics.length < 2) continue; // Need at least 2 points for a trend
    
    // Calculate simple trend (is it going up or down?)
    const firstValue = Number(sortedMetrics[0].value);
    const lastValue = Number(sortedMetrics[sortedMetrics.length - 1].value);
    
    // Calculate percentage change
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    // Determine trend direction
    let trendDirection = 'neutral';
    if (percentChange > 5) trendDirection = 'up';
    if (percentChange < -5) trendDirection = 'down';
    
    if (trendDirection !== 'neutral') {
      trendsDetected++;
      
      // Store trend data in the database
      await supabase.from('kpi_metrics').upsert({
        tenant_id,
        metric: `${metricName} Trend`, 
        value: percentChange,
        recorded_at: new Date().toISOString()
      });
      
      trends.push({
        metric: metricName,
        change_percent: percentChange,
        trend: trendDirection
      });
    }
  }
  
  // Log success
  await supabase.from('cron_job_logs').insert({
    function_name: 'fetch-kpi-trend',
    status: 'success',
    message: `Analyzed ${Object.keys(metricsByName).length} KPI metrics for tenant ${tenant_id}, detected ${trendsDetected} trends`
  });

  return {
    tenant_id,
    metrics_analyzed: Object.keys(metricsByName).length,
    trends_detected: trendsDetected,
    trends
  };
}

async function sendSlackAlert(functionName: string, errorMessage: string) {
  const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  if (!slackWebhookUrl) {
    console.log('No Slack webhook URL configured, skipping alert');
    return;
  }

  const message = `🚨 CRON job failed: *${functionName}*\nError: \`${errorMessage}\`\nTime: ${new Date().toISOString()}`;

  await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message })
  });
}

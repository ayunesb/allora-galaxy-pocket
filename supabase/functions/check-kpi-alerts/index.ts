
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
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Parse request body if present
    let tenantFilter = null;
    let threshold = 10; // Default threshold percentage

    try {
      const body = await req.json();
      tenantFilter = body.tenant_id;
      if (body.threshold) threshold = body.threshold;
    } catch (e) {
      // No body or invalid JSON, use defaults
    }

    // Get all KPI metrics to check for alerts
    const kpiQuery = supabase
      .from('kpi_metrics')
      .select('tenant_id, metric, value')
      .order('recorded_at', { ascending: false });
    
    if (tenantFilter) {
      kpiQuery.eq('tenant_id', tenantFilter);
    }

    const { data: kpiData, error: kpiError } = await kpiQuery;
    
    if (kpiError) {
      throw kpiError;
    }

    // Group the most recent KPI data by tenant and metric
    const kpiMap = new Map();
    
    for (const metric of kpiData) {
      const key = `${metric.tenant_id}:${metric.metric}`;
      if (!kpiMap.has(key)) {
        kpiMap.set(key, metric);
      }
    }
    
    // Get historical data to compare
    const { data: historyData, error: historyError } = await supabase
      .from('kpi_metrics_history')
      .select('tenant_id, metric, value')
      .order('recorded_at', { ascending: false });
      
    if (historyError) {
      throw historyError;
    }

    // Group historical data
    const historyMap = new Map();
    for (const history of historyData) {
      const key = `${history.tenant_id}:${history.metric}`;
      if (!historyMap.has(key)) {
        historyMap.set(key, history);
      }
    }

    // Compare current values with historical values and generate alerts
    const alerts = [];

    for (const [key, current] of kpiMap.entries()) {
      const history = historyMap.get(key);
      
      // Skip if no historical data to compare
      if (!history) continue;

      const percentChange = history.value === 0 
        ? (current.value > 0 ? 100 : 0) 
        : ((current.value - history.value) / history.value) * 100;
      
      // Alert if significant decrease
      if (percentChange <= -threshold) {
        const alert = {
          tenant_id: current.tenant_id,
          metric: current.metric,
          current_value: current.value,
          previous_value: history.value,
          percent_change: percentChange,
          alert_type: 'decrease'
        };
        
        alerts.push(alert);
        
        // Insert alert into agent_alerts table
        await supabase.from('agent_alerts').insert({
          tenant_id: current.tenant_id,
          alert_type: 'kpi_drop',
          agent: 'SystemMonitor',
          message: `KPI Alert: ${current.metric} decreased by ${Math.abs(percentChange.toFixed(1))}% (from ${history.value} to ${current.value})`
        });
        
        // Create recovery strategy if specified in request
        if (body?.generate_recovery && percentChange <= -15) {  // More severe drops
          await supabase.functions.invoke('strategy-adjustments', {
            body: { 
              tenant_id: current.tenant_id,
              metric: current.metric,
              drop_percentage: Math.abs(percentChange)
            }
          });
        }
      }
    }

    // Log the check in system logs
    await supabase.from('cron_job_logs').insert({
      function_name: 'check-kpi-alerts',
      status: 'success',
      message: `Checked ${kpiMap.size} KPIs, found ${alerts.length} alerts`
    });

    return new Response(JSON.stringify({ 
      success: true, 
      alerts_count: alerts.length,
      alerts 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error checking KPI alerts:', error);
    
    // Log the error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    await supabase.from('cron_job_logs').insert({
      function_name: 'check-kpi-alerts',
      status: 'error',
      message: `Error: ${error.message}`
    });
    
    return new Response(JSON.stringify({ 
      error: 'Failed to check KPI alerts',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

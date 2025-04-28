
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
    // Initialize Supabase client with environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let tenantId: string | null = null;
    
    try {
      const body = await req.json();
      tenantId = body.tenant_id || null;
    } catch (e) {
      // No body or invalid JSON
      console.error("Error parsing request body:", e);
    }

    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: "tenant_id is required in the request body" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all alert rules for the tenant
    const { data: rules, error: rulesError } = await supabase
      .from('kpi_alert_rules')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('active', true);

    if (rulesError) throw rulesError;

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No alert rules found for this tenant", alerts: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process each rule
    const alerts = [];
    for (const rule of rules) {
      // Get the current metric value
      const { data: metrics, error: metricsError } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('metric', rule.kpi_name)
        .order('recorded_at', { ascending: false })
        .limit(1);

      if (metricsError) throw metricsError;
      
      if (!metrics || metrics.length === 0) continue;
      
      const currentMetric = metrics[0];
      
      // Get comparison value based on compare_period
      let comparisonDate = new Date();
      switch (rule.compare_period) {
        case '1d':
        case 'day':
          comparisonDate.setDate(comparisonDate.getDate() - 1);
          break;
        case '7d':
        case 'week':
          comparisonDate.setDate(comparisonDate.getDate() - 7);
          break;
        case '30d':
        case 'month':
          comparisonDate.setDate(comparisonDate.getDate() - 30);
          break;
        case '90d':
          comparisonDate.setDate(comparisonDate.getDate() - 90);
          break;
        default:
          comparisonDate.setDate(comparisonDate.getDate() - 7); // Default to weekly comparison
      }
      
      const { data: historicalMetrics, error: historyError } = await supabase
        .from('kpi_metrics_history')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('metric', rule.kpi_name)
        .lt('recorded_at', comparisonDate.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1);
        
      if (historyError) throw historyError;
      
      if (!historicalMetrics || historicalMetrics.length === 0) continue;
      
      const historicalMetric = historicalMetrics[0];
      const currentValue = parseFloat(currentMetric.value);
      const previousValue = parseFloat(historicalMetric.value);
      let thresholdExceeded = false;
      let percentChange = 0;
      
      if (previousValue !== 0) {
        percentChange = ((currentValue - previousValue) / previousValue) * 100;
      }
      
      // Check if the threshold is exceeded based on the condition
      switch (rule.condition) {
        case '>':
        case 'above':
          thresholdExceeded = currentValue > rule.threshold;
          break;
        case '<':
        case 'below':
          thresholdExceeded = currentValue < rule.threshold;
          break;
        case 'falls_by_%':
          thresholdExceeded = percentChange < -rule.threshold;
          break;
        case 'rises_by_%':
          thresholdExceeded = percentChange > rule.threshold;
          break;
      }
      
      if (thresholdExceeded) {
        // Create or update an alert
        const alertData = {
          tenant_id: tenantId,
          kpi_name: rule.kpi_name,
          description: `Alert triggered for ${rule.kpi_name}`,
          severity: rule.severity,
          threshold: rule.threshold,
          condition: rule.condition,
          current_value: currentValue,
          previous_value: previousValue,
          percent_change: percentChange,
          campaign_id: rule.campaign_id,
          status: 'triggered',
          message: generateAlertMessage(rule, currentValue, previousValue, percentChange),
        };
        
        const { data: alert, error: alertError } = await supabase
          .from('kpi_alerts')
          .insert(alertData)
          .select()
          .single();
          
        if (alertError) throw alertError;
        
        alerts.push(alert);
      }
    }
    
    // Log the activity
    await supabase.from('cron_job_logs').insert({
      function_name: 'kpi-alerts',
      status: 'success',
      message: `Processed ${rules.length} rules, created ${alerts.length} alerts`,
      tenant_id: tenantId
    });
    
    return new Response(
      JSON.stringify({ success: true, alerts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error processing KPI alerts:", error);
    
    return new Response(
      JSON.stringify({ error: "Failed to process KPI alerts", details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateAlertMessage(rule: any, currentValue: number, previousValue: number, percentChange: number): string {
  // Use rule.message if available, otherwise generate default message
  if (rule.message) {
    return rule.message
      .replace('{{value}}', currentValue)
      .replace('{{previousValue}}', previousValue)
      .replace('{{threshold}}', rule.threshold)
      .replace('{{percentChange}}', Math.abs(percentChange).toFixed(2) + '%');
  }
  
  switch (rule.condition) {
    case '>':
    case 'above':
      return `${rule.kpi_name} is ${currentValue}, which exceeds the threshold of ${rule.threshold}`;
    case '<':
    case 'below':
      return `${rule.kpi_name} is ${currentValue}, which is below the threshold of ${rule.threshold}`;
    case 'falls_by_%':
      return `${rule.kpi_name} has fallen by ${Math.abs(percentChange).toFixed(2)}% from ${previousValue} to ${currentValue}`;
    case 'rises_by_%':
      return `${rule.kpi_name} has risen by ${percentChange.toFixed(2)}% from ${previousValue} to ${currentValue}`;
    default:
      return `Alert for ${rule.kpi_name}: current value is ${currentValue}`;
  }
}

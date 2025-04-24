
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
    const { tenant_id } = await req.json();
    
    if (!tenant_id) {
      throw new Error("Missing required tenant_id parameter");
    }
    
    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    console.log(`Starting KPI alert check for tenant ${tenant_id}`);
    
    // Step 1: Get all active alert rules for the tenant
    const { data: rules, error: rulesError } = await supabase
      .from('kpi_alert_rules')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('active', true);
    
    if (rulesError) throw rulesError;
    
    if (!rules || rules.length === 0) {
      console.log(`No active alert rules found for tenant ${tenant_id}`);
      return new Response(JSON.stringify({ message: "No active alert rules found" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Found ${rules.length} active alert rules`);
    
    // Step 2: Process each rule and check metric conditions
    const alerts = [];
    
    for (const rule of rules) {
      console.log(`Processing rule for KPI: ${rule.kpi_name}`);
      
      // Get current value of the KPI metric
      const { data: currentMetric, error: metricError } = await supabase
        .from('kpi_metrics')
        .select('value, updated_at')
        .eq('tenant_id', tenant_id)
        .eq('metric', rule.kpi_name)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (metricError) {
        console.error(`Error fetching metric ${rule.kpi_name}:`, metricError);
        continue;
      }
      
      if (!currentMetric) {
        console.log(`No data found for metric ${rule.kpi_name}`);
        continue;
      }
      
      // Get previous value based on comparison period
      let previousDate = new Date();
      if (rule.compare_period === '1d') {
        previousDate.setDate(previousDate.getDate() - 1);
      } else if (rule.compare_period === '7d') {
        previousDate.setDate(previousDate.getDate() - 7);
      } else if (rule.compare_period === '30d') {
        previousDate.setDate(previousDate.getDate() - 30);
      }
      
      const { data: previousMetric, error: prevError } = await supabase
        .from('kpi_metrics_history')
        .select('value, recorded_at')
        .eq('tenant_id', tenant_id)
        .eq('metric', rule.kpi_name)
        .lt('recorded_at', previousDate.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (prevError) {
        console.error(`Error fetching previous metric for ${rule.kpi_name}:`, prevError);
        continue;
      }
      
      // Calculate percentage change if we have previous data
      let percentChange = 0;
      if (previousMetric && previousMetric.value > 0) {
        percentChange = ((currentMetric.value - previousMetric.value) / previousMetric.value) * 100;
      }
      
      // Check if alert condition is met
      let alertTriggered = false;
      let alertReason = '';
      
      switch (rule.condition) {
        case '<':
          alertTriggered = currentMetric.value < rule.threshold;
          alertReason = `Value (${currentMetric.value}) is below threshold (${rule.threshold})`;
          break;
        case '>':
          alertTriggered = currentMetric.value > rule.threshold;
          alertReason = `Value (${currentMetric.value}) is above threshold (${rule.threshold})`;
          break;
        case 'falls_by_%':
          alertTriggered = percentChange < -Math.abs(rule.threshold);
          alertReason = `Value decreased by ${Math.abs(percentChange).toFixed(1)}% which exceeds threshold of ${rule.threshold}%`;
          break;
        case 'rises_by_%':
          alertTriggered = percentChange > rule.threshold;
          alertReason = `Value increased by ${percentChange.toFixed(1)}% which exceeds threshold of ${rule.threshold}%`;
          break;
      }
      
      if (alertTriggered) {
        console.log(`Alert triggered for ${rule.kpi_name}: ${alertReason}`);
        
        // Check if we already have an active alert for this KPI
        const { data: existingAlert, error: alertError } = await supabase
          .from('kpi_insights')
          .select('id')
          .eq('tenant_id', tenant_id)
          .eq('kpi_name', rule.kpi_name)
          .eq('outcome', 'pending')
          .limit(1);
        
        if (alertError) {
          console.error(`Error checking existing alerts:`, alertError);
          continue;
        }
        
        // Only create a new alert if there isn't an existing one
        if (!existingAlert || existingAlert.length === 0) {
          // Create new alert
          const { data: newAlert, error: insertError } = await supabase
            .from('kpi_insights')
            .insert({
              tenant_id: tenant_id,
              kpi_name: rule.kpi_name,
              description: alertReason,
              current_value: currentMetric.value,
              previous_value: previousMetric?.value || null,
              target: rule.threshold,
              percent_change: percentChange,
              severity: rule.severity || 'medium',
              outcome: 'pending',
              campaign_id: rule.campaign_id
            })
            .select()
            .single();
          
          if (insertError) {
            console.error(`Error creating alert:`, insertError);
            continue;
          }
          
          alerts.push(newAlert);
          
          // Also create a notification
          const { error: notifError } = await supabase
            .from('notifications')
            .insert({
              tenant_id: tenant_id,
              event_type: `KPI Alert: ${rule.kpi_name}`,
              description: alertReason,
              is_read: false
            });
          
          if (notifError) {
            console.error(`Error creating notification:`, notifError);
          }
        } else {
          console.log(`Alert for ${rule.kpi_name} already exists, skipping creation`);
        }
      } else {
        console.log(`No alert triggered for ${rule.kpi_name}`);
      }
    }
    
    // Log run in cron_job_logs
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'check-kpi-alerts',
        status: 'success',
        message: `Processed ${rules.length} rules, generated ${alerts.length} alerts`,
        meta: { tenant_id, alerts_count: alerts.length }
      });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts_created: alerts.length,
        alerts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in check-kpi-alerts:", error.message);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'check-kpi-alerts',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type LogLevel = 'info' | 'error' | 'debug' | 'warn';

// Logging utility
function log(message: string, level: LogLevel = 'info', data?: any) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data ? { data } : {})
  };
  
  console.log(JSON.stringify(logEntry));
}

// Error handling utility
async function logError(supabase: any, functionName: string, error: any, tenantId?: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  log(`Error in ${functionName}: ${errorMessage}`, 'error', { error, stack: error.stack });
  
  try {
    await supabase.from('cron_job_logs').insert({
      function_name: functionName,
      status: 'error',
      message: `Error: ${errorMessage}`,
      ...(tenantId ? { tenant_id: tenantId } : {}),
      duration_ms: 0,
      error_details: {
        message: errorMessage,
        stack: error.stack
      }
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
}

serve(async (req) => {
  const functionName = 'check-kpi-alerts';
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let tenantId = null;
  let threshold = 10; // Default threshold percentage
  let requestBody = {};
  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Parse request body if present
    try {
      requestBody = await req.json();
      tenantId = requestBody.tenant_id;
      if (requestBody.threshold) threshold = requestBody.threshold;
    } catch (e) {
      // No body or invalid JSON, use defaults
      log('No valid request body provided, using defaults', 'warn');
    }

    log(`Starting KPI check${tenantId ? ' for tenant ' + tenantId : ''}`, 'info', { threshold });

    // Get all KPI metrics to check for alerts
    const kpiQuery = supabase
      .from('kpi_metrics')
      .select('tenant_id, metric, value')
      .order('recorded_at', { ascending: false });
    
    if (tenantId) {
      kpiQuery.eq('tenant_id', tenantId);
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
    
    log(`Retrieved ${kpiData.length} KPI metrics, ${kpiMap.size} unique metrics`, 'info');
    
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

    log(`Retrieved ${historyData.length} KPI history metrics, ${historyMap.size} unique metrics`, 'info');

    // Compare current values with historical values and generate alerts
    const alerts = [];
    const alertInserts = [];

    for (const [key, current] of kpiMap.entries()) {
      const history = historyMap.get(key);
      
      // Skip if no historical data to compare
      if (!history) {
        log(`No history for ${key}, skipping alert check`, 'debug');
        continue;
      }

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
        
        // Prepare agent alert for insertion
        alertInserts.push({
          tenant_id: current.tenant_id,
          alert_type: 'kpi_drop',
          agent: 'SystemMonitor',
          message: `KPI Alert: ${current.metric} decreased by ${Math.abs(percentChange.toFixed(1))}% (from ${history.value} to ${current.value})`,
          severity: percentChange <= -20 ? 'high' : 'medium',
          status: 'triggered',
          triggered_at: new Date().toISOString()
        });
        
        // Create recovery strategy if specified in request and drop is severe
        if (requestBody?.generate_recovery && percentChange <= -15) {
          log(`Severe drop detected (${percentChange}%), generating recovery strategy`, 'info', { 
            metric: current.metric,
            tenant_id: current.tenant_id
          });
          
          try {
            await supabase.functions.invoke('strategy-adjustments', {
              body: { 
                tenant_id: current.tenant_id,
                metric: current.metric,
                drop_percentage: Math.abs(percentChange)
              }
            });
          } catch (strategyError) {
            log(`Failed to generate recovery strategy`, 'error', { error: strategyError });
            // Continue execution, don't fail the whole function
          }
        }
      }
    }

    // Batch insert alerts if any
    if (alertInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('agent_alerts')
        .insert(alertInserts);
        
      if (insertError) {
        log(`Failed to insert ${alertInserts.length} alerts`, 'error', { error: insertError });
      } else {
        log(`Successfully inserted ${alertInserts.length} alerts`, 'info');
      }
    }

    const duration = Date.now() - startTime;

    // Log the check in system logs
    await supabase.from('cron_job_logs').insert({
      function_name: functionName,
      status: 'success',
      message: `Checked ${kpiMap.size} KPIs, found ${alerts.length} alerts`,
      tenant_id: tenantId,
      duration_ms: duration
    });

    return new Response(JSON.stringify({ 
      success: true, 
      alerts_count: alerts.length,
      alerts,
      duration_ms: duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log(`Error checking KPI alerts:`, 'error', { error });
    
    // Log the error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    await logError(supabase, functionName, error, tenantId);
    
    return new Response(JSON.stringify({ 
      error: 'Failed to check KPI alerts',
      details: error.message || 'Unknown error',
      request: requestBody
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});


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
    
    console.log(`Starting MQL metrics update for tenant ${tenant_id}`);
    
    // Calculate date range
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    // Get MQL counts for both time periods
    const { data: recentMQLs, error: recentError } = await supabase
      .from('kpi_metrics')
      .select('value')
      .eq('tenant_id', tenant_id)
      .eq('metric', 'Qualified Leads (7d)')
      .order('recorded_at', { ascending: false })
      .limit(4); // Last 4 weeks (28 days)
    
    if (recentError) throw recentError;
    
    // Get historical MQL data
    const { data: historicalMQLs, error: historicalError } = await supabase
      .from('kpi_metrics_history')
      .select('value')
      .eq('tenant_id', tenant_id)
      .eq('metric', 'Qualified Leads (7d)')
      .gte('recorded_at', sixtyDaysAgo.toISOString())
      .lt('recorded_at', thirtyDaysAgo.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(4); // Previous 4 weeks
    
    if (historicalError) throw historicalError;
    
    // Calculate totals and growth rate
    const recentTotal = recentMQLs?.reduce((sum, item) => sum + Number(item.value), 0) || 0;
    const previousTotal = historicalMQLs?.reduce((sum, item) => sum + Number(item.value), 0) || 0;
    
    let growthRate = 0;
    if (previousTotal > 0) {
      growthRate = ((recentTotal - previousTotal) / previousTotal) * 100;
    }
    
    // Store calculated metrics
    const metrics = [
      {
        tenant_id,
        metric: 'Monthly MQL Total',
        value: recentTotal,
        recorded_at: today.toISOString()
      },
      {
        tenant_id,
        metric: 'MQL Growth Rate',
        value: Math.round(growthRate * 10) / 10, // Round to 1 decimal place
        recorded_at: today.toISOString()
      }
    ];
    
    // Insert metrics
    const { error: insertError } = await supabase
      .from('kpi_metrics')
      .upsert(metrics, { onConflict: 'tenant_id,metric,recorded_at' });
    
    if (insertError) throw insertError;
    
    // Also update the mql_kpi_delta view for quick access
    const { error: deltaError } = await supabase
      .from('mql_kpi_delta')
      .upsert({
        tenant_id,
        kpi_name: 'Monthly MQL Total',
        recent: recentTotal,
        previous: previousTotal,
        delta: growthRate
      }, { onConflict: 'tenant_id,kpi_name' });
    
    if (deltaError) throw deltaError;
    
    // Log the operation in cron_job_logs
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'update-mql-metrics',
        status: 'success',
        message: `MQL metrics updated for tenant ${tenant_id}. Current: ${recentTotal}, Previous: ${previousTotal}, Growth: ${growthRate.toFixed(1)}%`,
        meta: { tenant_id, recent_total: recentTotal, previous_total: previousTotal, growth_rate: growthRate }
      });
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        metrics: {
          recent_total: recentTotal,
          previous_total: previousTotal,
          growth_rate: growthRate
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in update-mql-metrics:", error.message);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'update-mql-metrics',
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

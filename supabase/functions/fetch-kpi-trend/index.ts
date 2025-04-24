
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
    const { tenant_id, metric_name, days = 30 } = await req.json();
    
    if (!tenant_id || !metric_name) {
      throw new Error("Missing required parameters: tenant_id and metric_name");
    }
    
    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Calculate start date based on days parameter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Fetch historical data from kpi_metrics_history
    const { data: historyData, error: historyError } = await supabase
      .from('kpi_metrics_history')
      .select('value, recorded_at')
      .eq('tenant_id', tenant_id)
      .eq('metric', metric_name)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });
    
    if (historyError) throw historyError;
    
    // Also get the current value from kpi_metrics
    const { data: currentData, error: currentError } = await supabase
      .from('kpi_metrics')
      .select('value, updated_at')
      .eq('tenant_id', tenant_id)
      .eq('metric', metric_name)
      .limit(1)
      .single();
    
    if (currentError && currentError.code !== 'PGRST116') { // Don't throw if no results were found
      throw currentError;
    }
    
    // Combine historical and current data
    const trendData = [
      ...(historyData || []).map(item => ({
        value: Number(item.value),
        date: new Date(item.recorded_at).toISOString().split('T')[0]
      }))
    ];
    
    // Add current value if it exists
    if (currentData) {
      const currentDate = new Date(currentData.updated_at).toISOString().split('T')[0];
      
      // Check if we already have data for today
      const hasTodayData = trendData.some(item => item.date === currentDate);
      
      if (!hasTodayData) {
        trendData.push({
          value: Number(currentData.value),
          date: currentDate
        });
      }
    }
    
    // Log the operation in cron_job_logs
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'fetch-kpi-trend',
        status: 'success',
        message: `Fetched trend data for ${metric_name} over ${days} days`,
        meta: { tenant_id, metric_name, days, data_points: trendData.length }
      });
    
    return new Response(
      JSON.stringify(trendData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in fetch-kpi-trend:", error.message);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'fetch-kpi-trend',
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

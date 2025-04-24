
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

    // Get all tenants to process
    const { data: tenants, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id,name');

    if (tenantError) throw tenantError;
    
    console.log(`Processing MQL metrics for ${tenants?.length || 0} tenants`);
    
    if (!tenants || tenants.length === 0) {
      return new Response(JSON.stringify({ message: 'No tenants to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Results tracking
    const results = [];
    
    // Process each tenant
    for (const tenant of tenants) {
      try {
        console.log(`Processing tenant: ${tenant.name} (${tenant.id})`);
        
        // Get data for the last 14 days
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Fetch data from last 7 days
        const { data: recent7days, error: recent7Error } = await supabase
          .from('kpi_metrics')
          .select('value')
          .eq('tenant_id', tenant.id)
          .eq('metric', 'MQLs')
          .gte('recorded_at', sevenDaysAgo.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(1);
          
        // Fetch data from previous 7 days
        const { data: previous7days, error: previous7Error } = await supabase
          .from('kpi_metrics')
          .select('value')
          .eq('tenant_id', tenant.id)
          .eq('metric', 'MQLs')
          .lt('recorded_at', sevenDaysAgo.toISOString())
          .gte('recorded_at', fourteenDaysAgo.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(1);
          
        if (recent7Error) console.error(`Error fetching recent MQL data for ${tenant.id}:`, recent7Error);
        if (previous7Error) console.error(`Error fetching previous MQL data for ${tenant.id}:`, previous7Error);
        
        // Default values if no data found
        const recentValue = recent7days?.[0]?.value || 0;
        const previousValue = previous7days?.[0]?.value || 0;
        
        // Calculate percent change
        let percentChange = 0;
        if (previousValue > 0) {
          percentChange = ((recentValue - previousValue) / previousValue) * 100;
        }
        
        console.log(`Tenant ${tenant.id}: Recent=${recentValue}, Previous=${previousValue}, Change=${percentChange.toFixed(2)}%`);
        
        // Store the rolling 7-day MQL metric
        await supabase
          .from('kpi_metrics')
          .insert({
            tenant_id: tenant.id,
            metric: 'Qualified Leads (7d)',
            value: recentValue
          });
        
        // Update the MQL delta view
        await supabase
          .from('mql_kpi_delta')
          .upsert({
            tenant_id: tenant.id,
            kpi_name: 'MQLs',
            recent: recentValue,
            previous: previousValue,
            delta: percentChange
          });
        
        // Add to results
        results.push({
          tenant_id: tenant.id,
          tenant_name: tenant.name,
          recent: recentValue,
          previous: previousValue,
          delta: percentChange
        });
        
      } catch (tenantError) {
        console.error(`Error processing tenant ${tenant.id}:`, tenantError);
      }
    }

    // Log completion in the cron_job_logs table
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'update-mql-metrics',
        status: 'success',
        message: `Processed MQL metrics for ${tenants.length} tenants`
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: tenants.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-mql-metrics function:', error);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'update-mql-metrics',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

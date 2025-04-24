
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenant_id } = await req.json();
    
    if (!tenant_id) {
      throw new Error("Missing required tenant_id parameter");
    }
    
    // Initialize Supabase client with the service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting demo tenant reset for tenant ${tenant_id}`);
    
    // 1. Verify this is actually a demo tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('is_demo')
      .eq('id', tenant_id)
      .single();
    
    if (tenantError) throw tenantError;
    
    if (!tenant || !tenant.is_demo) {
      throw new Error("Cannot reset a non-demo tenant");
    }
    
    console.log("Confirmed demo tenant status, proceeding with reset");
    
    // 2. Reset campaign data
    const { error: campaignError } = await supabase
      .from('campaigns')
      .update({ 
        status: 'draft', 
        performance_data: null,
        updated_at: new Date().toISOString() 
      })
      .eq('tenant_id', tenant_id);
    
    if (campaignError) {
      console.error("Error resetting campaigns:", campaignError);
    } else {
      console.log("Successfully reset campaigns");
    }
    
    // 3. Reset KPI metrics to default values
    const { error: kpiError } = await supabase
      .from('kpi_metrics')
      .update({ 
        value: 0,
        updated_at: new Date().toISOString() 
      })
      .eq('tenant_id', tenant_id);
    
    if (kpiError) {
      console.error("Error resetting KPI metrics:", kpiError);
    } else {
      console.log("Successfully reset KPI metrics");
    }
    
    // 4. Clear KPI insights/alerts
    const { error: insightsError } = await supabase
      .from('kpi_insights')
      .delete()
      .eq('tenant_id', tenant_id);
    
    if (insightsError) {
      console.error("Error clearing KPI insights:", insightsError);
    } else {
      console.log("Successfully cleared KPI insights");
    }
    
    // 5. Reset credit usage
    const { error: creditsError } = await supabase
      .from('tenant_profiles')
      .update({ 
        usage_credits: 100  // Reset to default value
      })
      .eq('id', tenant_id);
    
    if (creditsError) {
      console.error("Error resetting credits:", creditsError);
    } else {
      console.log("Successfully reset credits");
    }
    
    // 6. Clear notifications
    const { error: notificationError } = await supabase
      .from('notifications')
      .delete()
      .eq('tenant_id', tenant_id);
    
    if (notificationError) {
      console.error("Error clearing notifications:", notificationError);
    } else {
      console.log("Successfully cleared notifications");
    }
    
    // 7. Add a success log entry
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'reset-demo-tenant',
        status: 'success',
        message: `Demo tenant ${tenant_id} reset successfully`,
        meta: { tenant_id }
      });
    
    console.log(`Demo tenant reset completed for ${tenant_id}`);
    
    return new Response(
      JSON.stringify({ success: true, message: "Demo tenant reset successfully" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in reset-demo-tenant:", error.message);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'reset-demo-tenant',
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


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

    console.log('Starting demo tenant reset...');

    // Find the demo tenant
    const { data: demoTenants, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('id, name')
      .eq('is_demo', true);

    if (tenantError) {
      throw new Error(`Failed to find demo tenant: ${tenantError.message}`);
    }

    if (!demoTenants || demoTenants.length === 0) {
      console.log('No demo tenant found to reset');
      return new Response(JSON.stringify({ message: 'No demo tenant found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resetResults = [];
    
    // Process each demo tenant
    for (const tenant of demoTenants) {
      console.log(`Resetting demo tenant: ${tenant.name} (${tenant.id})`);
      
      // 1. Reset campaigns
      const { error: campaignError } = await supabase
        .from('campaigns')
        .delete()
        .eq('tenant_id', tenant.id);
      
      if (campaignError) {
        console.error(`Error deleting campaigns for tenant ${tenant.id}:`, campaignError);
      }
      
      // 2. Insert default campaigns
      const { error: insertCampaignError } = await supabase
        .from('campaigns')
        .insert([
          {
            tenant_id: tenant.id,
            name: 'Demo Campaign 1',
            status: 'active',
            description: 'This is an example active campaign',
            scripts: { email: "Hi there, this is a demo campaign script!" }
          },
          {
            tenant_id: tenant.id,
            name: 'Demo Campaign 2',
            status: 'draft',
            description: 'This is an example draft campaign'
          }
        ]);
      
      if (insertCampaignError) {
        console.error(`Error inserting demo campaigns for tenant ${tenant.id}:`, insertCampaignError);
      }
      
      // 3. Reset KPI metrics
      const { error: kpiError } = await supabase
        .from('kpi_metrics')
        .delete()
        .eq('tenant_id', tenant.id);
      
      if (kpiError) {
        console.error(`Error deleting KPI metrics for tenant ${tenant.id}:`, kpiError);
      }
      
      // 4. Insert default KPI metrics
      const { error: insertKpiError } = await supabase
        .from('kpi_metrics')
        .insert([
          { tenant_id: tenant.id, metric: 'MQLs', value: 45 },
          { tenant_id: tenant.id, metric: 'Conversion Rate', value: 3.2 },
          { tenant_id: tenant.id, metric: 'Revenue', value: 12500 },
          { tenant_id: tenant.id, metric: 'Qualified Leads (7d)', value: 12 }
        ]);
      
      if (insertKpiError) {
        console.error(`Error inserting demo KPI metrics for tenant ${tenant.id}:`, insertKpiError);
      }
      
      // 5. Reset KPI insights
      const { error: insightError } = await supabase
        .from('kpi_insights')
        .delete()
        .eq('tenant_id', tenant.id);
      
      if (insightError) {
        console.error(`Error deleting KPI insights for tenant ${tenant.id}:`, insightError);
      }
      
      // 6. Reset notifications
      const { error: notifError } = await supabase
        .from('notifications')
        .delete()
        .eq('tenant_id', tenant.id);
      
      if (notifError) {
        console.error(`Error deleting notifications for tenant ${tenant.id}:`, notifError);
      }
      
      // 7. Reset usage credits to default (100)
      const { error: creditError } = await supabase
        .from('tenant_profiles')
        .update({ usage_credits: 100 })
        .eq('id', tenant.id);
      
      if (creditError) {
        console.error(`Error resetting credits for tenant ${tenant.id}:`, creditError);
      }
      
      resetResults.push({
        tenant_id: tenant.id,
        success: true
      });
    }

    // Log success
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'reset-demo-tenant',
        status: 'success',
        message: `Reset ${demoTenants.length} demo tenants`
      });

    return new Response(JSON.stringify({ 
      success: true,
      reset_count: demoTenants.length,
      results: resetResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in reset-demo-tenant function:', error);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') as string,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'reset-demo-tenant',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

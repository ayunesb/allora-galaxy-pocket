
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    
    // Log start of process
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'send-alert-digest',
        status: 'started',
        message: 'Starting weekly alert digest generation'
      });
    
    // Get all tenant profiles with active users
    const { data: tenants, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select(`
        id,
        name,
        tenant_user_roles!inner (
          user_id,
          role
        ),
        company_profiles!inner (
          name
        )
      `)
      .eq('tenant_user_roles.role', 'admin');

    if (tenantError) throw tenantError;
    
    console.log(`Processing ${tenants?.length || 0} tenants for weekly digest`);
    
    let successCount = 0;
    let errorCount = 0;

    for (const tenant of tenants || []) {
      try {
        // Get admin user's email
        const { data: adminUser } = await supabase
          .from('profiles')
          .select('id, avatar_url')
          .eq('id', tenant.tenant_user_roles[0].user_id)
          .single();

        // Get admin's auth user data to get email
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({
          filters: {
            id: tenant.tenant_user_roles[0].user_id
          }
        });

        if (authError || !users || users.length === 0) {
          throw new Error(`Could not retrieve admin user email: ${authError?.message || 'User not found'}`);
        }

        const adminEmail = users[0].email;
        
        if (!adminEmail) {
          throw new Error('Admin email not found');
        }

        // Fetch MQL changes from our view or compute it
        const { data: mqlData } = await supabase
          .from('mql_kpi_delta')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single();
        
        let mqlDelta = 0;
        if (mqlData) {
          mqlDelta = mqlData.delta;
        } else {
          // Calculate MQL delta manually if the view doesn't exist
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          
          const fourteenDaysAgo = new Date();
          fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
          
          // Get MQL metrics from the last 7 days
          const { data: recentMQLs } = await supabase
            .from('kpi_metrics')
            .select('value')
            .eq('tenant_id', tenant.id)
            .eq('metric', 'Qualified Leads (7d)')
            .gte('recorded_at', sevenDaysAgo.toISOString())
            .order('recorded_at', { ascending: false })
            .limit(1);
            
          // Get MQL metrics from the previous 7 days
          const { data: previousMQLs } = await supabase
            .from('kpi_metrics')
            .select('value')
            .eq('tenant_id', tenant.id)
            .eq('metric', 'Qualified Leads (7d)')
            .lt('recorded_at', sevenDaysAgo.toISOString())
            .gte('recorded_at', fourteenDaysAgo.toISOString())
            .order('recorded_at', { ascending: false })
            .limit(1);
            
          const recentValue = recentMQLs?.[0]?.value || 0;
          const previousValue = previousMQLs?.[0]?.value || 0;
          
          if (previousValue > 0) {
            mqlDelta = ((recentValue - previousValue) / previousValue) * 100;
          }
        }

        // Get pending strategies
        const { data: strategies } = await supabase
          .from('strategies')
          .select('title, status, created_at')
          .eq('tenant_id', tenant.id)
          .in('status', ['pending_approval', 'rejected'])
          .order('created_at', { ascending: false })
          .limit(5);

        // Get KPI alerts and anomalies
        const { data: kpiMetrics } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .gte('recorded_at', new Date(Date.now() - 7 * 86400000).toISOString())
          .order('recorded_at', { ascending: false });
          
        // Get CRON job failures
        const { data: cronFailures } = await supabase
          .from('cron_job_logs')
          .select('*')
          .eq('status', 'error')
          .gte('ran_at', new Date(Date.now() - 7 * 86400000).toISOString())
          .order('ran_at', { ascending: false })
          .limit(5);

        // Generate email HTML
        const html = `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">🎯 Allora Weekly Summary - ${tenant.company_profiles[0].name}</h2>
            
            ${mqlDelta < -5 ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 6px;">
                <h3 style="color: #DC2626; margin: 0 0 10px 0;">⚠️ MQL Alert</h3>
                <p style="margin: 0; color: #7F1D1D;">
                  MQLs have dropped by ${Math.abs(mqlDelta).toFixed(1)}% in the last 7 days
                </p>
              </div>
            ` : mqlDelta > 5 ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 6px;">
                <h3 style="color: #166534; margin: 0 0 10px 0;">✅ MQL Growth</h3>
                <p style="margin: 0; color: #166534;">
                  MQLs have increased by ${mqlDelta.toFixed(1)}% in the last 7 days
                </p>
              </div>
            ` : ''}

            ${strategies && strategies.length > 0 ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #F0FDF4; border: 1px solid #DCFCE7; border-radius: 6px;">
                <h3 style="color: #166534; margin: 0 0 10px 0;">📋 Pending Strategies</h3>
                ${strategies.map(s => `
                  <div style="margin: 5px 0;">
                    • ${s.title} <span style="color: #666;">(${s.status})</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            ${kpiMetrics && kpiMetrics.length > 0 ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 6px;">
                <h3 style="color: #1E40AF; margin: 0 0 10px 0;">📊 KPI Updates</h3>
                ${kpiMetrics.slice(0, 5).map(k => `
                  <div style="margin: 5px 0;">
                    ${k.metric}: ${k.value}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            
            ${cronFailures && cronFailures.length > 0 ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 6px;">
                <h3 style="color: #DC2626; margin: 0 0 10px 0;">⚠️ System Alerts</h3>
                ${cronFailures.map(f => `
                  <div style="margin: 5px 0;">
                    • ${f.function_name}: ${f.message}
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              View complete details in your <a href="https://app.allora-os.com/dashboard/kpi" style="color: #2563EB; text-decoration: none;">KPI Dashboard</a>
            </p>
          </div>
        `;

        // Send email using Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: "Allora OS <notifications@allora-os.com>",
          to: [adminEmail],
          subject: `📊 Weekly Analytics Digest - ${tenant.company_profiles[0].name}`,
          html,
        });

        if (emailError) {
          throw emailError;
        }

        console.log(`Sent digest to tenant ${tenant.id}`);
        successCount++;
      } catch (tenantError) {
        console.error(`Error processing tenant ${tenant.id}:`, tenantError);
        errorCount++;
        
        // Log error for this tenant
        await supabase
          .from('cron_job_logs')
          .insert({
            function_name: 'send-alert-digest',
            status: 'error',
            message: `Failed to process tenant ${tenant.id}: ${tenantError.message}`
          });
        
        // Continue with next tenant even if one fails
        continue;
      }
    }

    // Log completion
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'send-alert-digest',
        status: errorCount > 0 ? 'partial' : 'success',
        message: `Processed ${tenants?.length || 0} tenants: ${successCount} succeeded, ${errorCount} failed`
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: tenants?.length || 0,
        succeeded: successCount,
        failed: errorCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-alert-digest:', error);
    
    // Log the overall function failure
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'send-alert-digest',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    // Try to send Slack alert if configured
    try {
      const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
      if (slackWebhookUrl) {
        await fetch(slackWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: `🚨 CRON job failed: *send-alert-digest*\nError: \`${error.message}\`\nTime: ${new Date().toISOString()}` 
          })
        });
      }
    } catch (slackError) {
      console.error('Failed to send Slack alert:', slackError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

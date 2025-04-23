
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

    for (const tenant of tenants || []) {
      try {
        // Get admin user's email
        const { data: adminProfile } = await supabase
          .from('profiles')
          .select('id, avatar_url')
          .eq('id', tenant.tenant_user_roles[0].user_id)
          .single();

        // Fetch MQL changes from our view
        const { data: mqlData } = await supabase
          .from('mql_kpi_delta')
          .select('*')
          .eq('tenant_id', tenant.id)
          .single();

        // Get pending strategies
        const { data: strategies } = await supabase
          .from('strategies')
          .select('title, status, created_at')
          .eq('tenant_id', tenant.id)
          .in('status', ['pending_approval', 'rejected'])
          .order('created_at', { ascending: false })
          .limit(5);

        // Get KPI anomalies (significant changes)
        const { data: kpiMetrics } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .gte('recorded_at', new Date(Date.now() - 7 * 86400000).toISOString());

        const html = `
          <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">🎯 Allora Weekly Summary - ${tenant.company_profiles[0].name}</h2>
            
            ${mqlData?.delta < 0 ? `
              <div style="margin: 20px 0; padding: 15px; background-color: #FEF2F2; border: 1px solid #FEE2E2; border-radius: 6px;">
                <h3 style="color: #DC2626; margin: 0 0 10px 0;">⚠️ MQL Alert</h3>
                <p style="margin: 0; color: #7F1D1D;">
                  MQLs have dropped by ${Math.abs(mqlData.delta).toFixed(1)}% in the last 7 days
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
                ${kpiMetrics.map(k => `
                  <div style="margin: 5px 0;">
                    ${k.metric}: ${k.value}
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
        await resend.emails.send({
          from: "Allora OS <notifications@allora-os.com>",
          to: [tenant.tenant_user_roles[0].user_id],
          subject: `📊 Weekly Analytics Digest - ${tenant.company_profiles[0].name}`,
          html,
        });

        console.log(`Sent digest to tenant ${tenant.id}`);
      } catch (tenantError) {
        console.error(`Error processing tenant ${tenant.id}:`, tenantError);
        continue; // Continue with next tenant even if one fails
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-alert-digest:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

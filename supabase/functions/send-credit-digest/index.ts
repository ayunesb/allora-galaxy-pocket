
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Get all tenant admins
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenant_profiles')
      .select('id, name');

    if (tenantsError) throw tenantsError;

    for (const tenant of tenants) {
      // Get credit usage for this tenant
      const { data: usage, error: usageError } = await supabase
        .from('weekly_agent_credit_usage')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (usageError) {
        console.error(`Error fetching usage for tenant ${tenant.id}:`, usageError);
        continue;
      }

      if (!usage?.length) continue;

      // Get admin emails for this tenant
      const { data: adminRoles } = await supabase
        .from('tenant_user_roles')
        .select('user_id')
        .eq('tenant_id', tenant.id)
        .eq('role', 'admin');

      if (!adminRoles?.length) continue;

      const adminIds = adminRoles.map(role => role.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', adminIds);

      if (!profiles?.length) continue;

      // Create email content
      const rows = usage.map(u => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;">${u.agent_name}</td>
          <td style="padding: 8px;">${u.module}</td>
          <td style="padding: 8px; text-align: right;">${u.total_credits}</td>
        </tr>
      `).join('');

      const totalCredits = usage.reduce((sum, u) => sum + u.total_credits, 0);

      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Weekly AI Credit Usage Summary - ${tenant.name}</h2>
          <p>Total credits used this week: <strong>${totalCredits}</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="text-align: left; padding: 8px;">Agent</th>
                <th style="text-align: left; padding: 8px;">Module</th>
                <th style="text-align: right; padding: 8px;">Credits</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="color: #666; font-size: 0.9em; margin-top: 20px;">
            View complete billing details in your dashboard
          </p>
        </div>
      `;

      // Send email to all tenant admins
      for (const profile of profiles) {
        try {
          await resend.emails.send({
            from: "Allora OS <notifications@allora-os.com>",
            to: [profile.email],
            subject: `Weekly AI Credit Usage Report - ${tenant.name}`,
            html,
          });
          console.log(`Sent digest to ${profile.email} for tenant ${tenant.name}`);
        } catch (error) {
          console.error(`Failed to send email to ${profile.email}:`, error);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-credit-digest:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

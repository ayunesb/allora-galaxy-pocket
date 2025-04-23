
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
    const { tenant_id, month, email_to } = await req.json();
    
    if (!tenant_id || !month) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get tenant details
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('name')
      .eq('id', tenant_id)
      .single();

    if (tenantError) {
      throw new Error(`Error fetching tenant: ${tenantError.message}`);
    }

    // Query the tenant_invoice_data view for the invoice data
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('tenant_invoice_data')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('billing_month', month);

    if (invoiceError) {
      throw new Error(`Error fetching invoice data: ${invoiceError.message}`);
    }

    if (!invoiceData || invoiceData.length === 0) {
      return new Response(JSON.stringify({ message: "No invoice data found for this period" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Calculate totals
    const totalCredits = invoiceData.reduce((sum, item) => sum + item.credits, 0);
    const startDate = new Date(Math.min(...invoiceData.map(item => new Date(item.start_date).getTime()))).toLocaleDateString();
    const endDate = new Date(Math.max(...invoiceData.map(item => new Date(item.end_date).getTime()))).toLocaleDateString();

    // Generate an HTML invoice
    const rows = invoiceData.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 8px;">${item.agent_name}</td>
        <td style="padding: 8px;">${item.module}</td>
        <td style="padding: 8px;">${item.action || 'N/A'}</td>
        <td style="padding: 8px; text-align: right;">${item.credits}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto;">
        <h1 style="color: #333;">Allora Credit Usage Invoice</h1>
        <div style="margin-bottom: 20px;">
          <p><strong>Tenant:</strong> ${tenantData.name}</p>
          <p><strong>Period:</strong> ${startDate} to ${endDate}</p>
          <p><strong>Invoice Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="text-align: left; padding: 12px;">Agent</th>
              <th style="text-align: left; padding: 12px;">Module</th>
              <th style="text-align: left; padding: 12px;">Action</th>
              <th style="text-align: right; padding: 12px;">Credits</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
          <tfoot>
            <tr style="border-top: 2px solid #333; font-weight: bold;">
              <td colspan="3" style="padding: 12px; text-align: right;">Total Credits:</td>
              <td style="padding: 12px; text-align: right;">${totalCredits}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 30px; color: #666; font-size: 0.9em;">
          <p>This is an automatically generated invoice summary for your Allora credit usage.</p>
        </div>
      </div>
    `;

    // Log this invoice generation
    await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        event_type: 'invoice_generated',
        message: `Generated invoice for period ${month}`,
        meta: {
          total_credits: totalCredits,
          period: month
        }
      });

    // If email_to is provided, send the invoice via email
    if (email_to) {
      try {
        const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
        await resend.emails.send({
          from: "Allora OS <billing@allora-os.com>",
          to: [email_to],
          subject: `Allora Credit Usage Invoice - ${month}`,
          html: html,
        });
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
        // Continue with returning the HTML even if email fails
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      invoiceHtml: html,
      totalCredits,
      periodStart: startDate,
      periodEnd: endDate 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

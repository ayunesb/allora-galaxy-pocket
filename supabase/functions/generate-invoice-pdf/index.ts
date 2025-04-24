
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
    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request parameters
    const { tenantId, month } = await req.json();
    
    if (!tenantId || !month) {
      throw new Error("Missing required parameters");
    }

    console.log(`Generating invoice for tenant ${tenantId} for month ${month}`);
    
    // Get tenant details
    const { data: tenant, error: tenantError } = await supabase
      .from('tenant_profiles')
      .select('*')
      .eq('id', tenantId)
      .single();
      
    if (tenantError) {
      throw new Error(`Error fetching tenant: ${tenantError.message}`);
    }

    // Get billing profile
    const { data: billing, error: billingError } = await supabase
      .from('billing_profiles')
      .select('*')
      .eq('user_id', tenantId)
      .single();
    
    if (billingError && billingError.code !== 'PGRST116') {
      throw new Error(`Error fetching billing profile: ${billingError.message}`);
    }

    // Parse month and create date range
    const [year, monthNum] = month.split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1).toISOString();
    const endDate = new Date(year, monthNum, 0).toISOString();
    
    // Get credit usage for the month
    const { data: usage, error: usageError } = await supabase
      .from('credit_usage_log')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });
    
    if (usageError) {
      throw new Error(`Error fetching usage data: ${usageError.message}`);
    }
    
    // Calculate total usage
    const totalCreditsUsed = usage?.reduce((sum, item) => sum + (item.credits_used || 0), 0) || 0;
    
    // Get current date for invoice date
    const invoiceDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Generate invoice number
    const invoiceNumber = `INV-${tenantId.substring(0, 8)}-${month}`;
    
    // Create HTML invoice
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .company-details {
          text-align: right;
        }
        .invoice-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #2563eb;
        }
        .invoice-details {
          margin-bottom: 30px;
        }
        .invoice-details-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        thead {
          background-color: #f3f4f6;
        }
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        th {
          font-weight: 600;
        }
        .total-row {
          font-weight: bold;
        }
        .total-section {
          margin-top: 30px;
          display: flex;
          justify-content: flex-end;
        }
        .total-table {
          width: 300px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-header">
        <div>
          <div class="invoice-title">Allora OS</div>
          <div>AI-Native Business Operating System</div>
        </div>
        <div class="company-details">
          <div class="invoice-title">INVOICE</div>
          <div>Invoice #: ${invoiceNumber}</div>
          <div>Date: ${invoiceDate}</div>
        </div>
      </div>
      
      <div class="invoice-details">
        <div class="invoice-details-row">
          <div>
            <strong>Billed To:</strong><br>
            ${tenant.name || 'Customer'}<br>
            ${billing?.plan ? `${billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)} Plan` : 'Standard Plan'}<br>
          </div>
          <div>
            <strong>Billing Period:</strong><br>
            ${new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Agent</th>
            <th>Credits Used</th>
          </tr>
        </thead>
        <tbody>
          ${usage?.map(item => `
            <tr>
              <td>${new Date(item.created_at).toLocaleDateString()}</td>
              <td>${item.module}</td>
              <td>${item.agent_name}</td>
              <td>${item.credits_used}</td>
            </tr>
          `).join('') || '<tr><td colspan="4">No usage data for this period</td></tr>'}
        </tbody>
      </table>
      
      <div class="total-section">
        <table class="total-table">
          <tr>
            <td>Total Credits Used:</td>
            <td><strong>${totalCreditsUsed}</strong></td>
          </tr>
          <tr>
            <td>Plan Allowance:</td>
            <td>${
              billing?.plan === 'standard' ? '100 credits' : 
              billing?.plan === 'growth' ? '500 credits' : 
              billing?.plan === 'pro' ? '1000 credits' : 
              '100 credits'
            }</td>
          </tr>
        </table>
      </div>
      
      <div class="footer">
        <p>Thank you for using Allora OS!</p>
        <p>For billing questions, please contact support@alloraos.com</p>
      </div>
    </body>
    </html>
    `;

    return new Response(
      JSON.stringify({ 
        html,
        invoiceNumber,
        totalCreditsUsed,
        month
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error("Error generating invoice:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

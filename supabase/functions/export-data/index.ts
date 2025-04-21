
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
const resend = new Resend(resendApiKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportRequest {
  type: 'strategies' | 'leads' | 'kpis';
  tenantId: string;
  userId: string;
}

async function generateCSV(type: string, tenantId: string) {
  switch (type) {
    case 'strategies':
      const { data: strategies } = await supabase
        .from('vault_strategies')
        .select('*')
        .eq('tenant_id', tenantId);
      return strategies ? strategies.map(s => `${s.title},${s.description}`).join('\n') : '';
    
    case 'leads':
      // Add your leads query here
      return '';
    
    case 'kpis':
      const { data: kpis } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenantId);
      return kpis ? kpis.map(k => `${k.metric},${k.value}`).join('\n') : '';
    
    default:
      return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, tenantId, userId } = await req.json() as ExportRequest;

    // Create export log
    const { error: logError } = await supabase
      .from('export_logs')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        export_type: type,
        delivery_method: 'email',
        status: 'pending'
      });

    if (logError) throw logError;

    // Generate CSV
    const csvData = await generateCSV(type, tenantId);

    // Send email
    const { data, error } = await resend.emails.send({
      from: 'exports@allora.ai',
      to: ['user@example.com'], // Replace with actual user email from profile
      subject: `${type.toUpperCase()} Export Report`,
      text: `Your ${type} export report is attached.`,
      attachments: [{
        filename: `${type}_export.csv`,
        content: Buffer.from(csvData)
      }]
    });

    if (error) throw error;

    // Update export log
    await supabase
      .from('export_logs')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('export_type', type);

    return new Response(JSON.stringify({ status: 'Export successful' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Export error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

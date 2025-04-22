
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser access
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
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let data = [];
  
  switch (type) {
    case 'strategies':
      const { data: strategies } = await supabase
        .from('vault_strategies')
        .select('title,description,created_at')
        .eq('tenant_id', tenantId);
      data = strategies || [];
      break;
    
    case 'kpis':
      const { data: kpis } = await supabase
        .from('kpi_metrics')
        .select('metric,value,created_at')
        .eq('tenant_id', tenantId);
      data = kpis || [];
      break;

    default:
      throw new Error(`Unsupported export type: ${type}`);
  }

  if (!data.length) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => JSON.stringify(row[header] || '')).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, tenantId, userId } = await req.json() as ExportRequest;

    // Log export attempt
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create export log
    const { error: logError } = await supabase
      .from('export_logs')
      .insert({
        tenant_id: tenantId,
        user_id: userId,
        export_type: type,
        delivery_method: 'download',
        status: 'pending'
      });

    if (logError) throw logError;

    // Generate CSV
    const csvData = await generateCSV(type, tenantId);
    
    if (!csvData) {
      return new Response(
        JSON.stringify({ error: 'No data found' }), 
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Update export log
    await supabase
      .from('export_logs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('export_type', type);

    return new Response(csvData, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}_export.csv"`
      }
    });
  } catch (error) {
    console.error('Export error:', error);

    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

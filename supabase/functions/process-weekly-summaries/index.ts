
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize OpenAI and Supabase clients
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Log function start
    await supabase.from('cron_job_logs').insert({
      function_name: 'process-weekly-summaries',
      status: 'running',
      message: 'Processing weekly AI summaries'
    });

    // Get all pending summaries
    const { data: pendingSummaries, error: summariesError } = await supabase
      .from('weekly_ai_summaries')
      .select('id, tenant_id, week_start, metadata')
      .eq('summary', 'Pending summary generation');

    if (summariesError) throw summariesError;

    if (!pendingSummaries || pendingSummaries.length === 0) {
      // Log no pending summaries
      await supabase.from('cron_job_logs').insert({
        function_name: 'process-weekly-summaries',
        status: 'success',
        message: 'No pending summaries to process'
      });
      
      return new Response(JSON.stringify({ message: "No pending summaries to process" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing ${pendingSummaries.length} pending summaries`);
    
    // Process each pending summary
    for (const summaryRecord of pendingSummaries) {
      try {
        // Get tenant data
        const { data: tenant } = await supabase
          .from('tenant_profiles')
          .select('name')
          .eq('id', summaryRecord.tenant_id)
          .single();
        
        // Get the tenant's KPI metrics
        const { data: metrics } = await supabase
          .from('kpi_metrics')
          .select('metric, value')
          .eq('tenant_id', summaryRecord.tenant_id);
        
        // Get recent strategies
        const { data: strategies } = await supabase
          .from('strategies')
          .select('title, status, created_at')
          .eq('tenant_id', summaryRecord.tenant_id)
          .gte('created_at', new Date(summaryRecord.week_start).toISOString())
          .order('created_at', { ascending: false });
        
        // Create context for OpenAI
        const context = {
          tenant_name: tenant?.name || 'Unknown',
          week_start: summaryRecord.week_start,
          metrics: metrics || [],
          strategies: strategies || [],
          metric_changes: summaryRecord.metadata?.metrics || []
        };

        // Generate AI summary
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a business intelligence analyst. Generate a concise weekly summary of business activities and metrics."
            },
            {
              role: "user",
              content: `Generate a weekly summary for ${context.tenant_name} based on this data:
              
              Week Starting: ${new Date(context.week_start).toLocaleDateString()}
              
              KPI Metrics:
              ${context.metrics.map(m => `- ${m.metric}: ${m.value}`).join('\n')}
              
              Recent Strategies:
              ${context.strategies.map(s => `- ${s.title} (${s.status})`).join('\n')}
              
              Format the summary in markdown with sections for:
              1. Key Performance Overview
              2. Strategy Highlights
              3. Recommendations for Next Week`
            }
          ]
        });

        const summary = response.choices[0].message.content;

        // Update the summary record
        await supabase
          .from('weekly_ai_summaries')
          .update({
            summary,
            metadata: {
              ...summaryRecord.metadata,
              status: 'completed',
              processed_at: new Date().toISOString()
            }
          })
          .eq('id', summaryRecord.id);

        // Create a notification for the tenant
        await supabase.from('notifications').insert({
          tenant_id: summaryRecord.tenant_id,
          event_type: 'weekly_summary',
          description: 'Weekly AI summary is now available'
        });

        console.log(`Processed summary for tenant ${summaryRecord.tenant_id}`);

      } catch (summaryError) {
        console.error(`Error processing summary for tenant ${summaryRecord.tenant_id}:`, summaryError);
        
        // Update the record with the error
        await supabase
          .from('weekly_ai_summaries')
          .update({
            summary: 'Error generating summary',
            metadata: {
              ...summaryRecord.metadata,
              status: 'error',
              error_message: summaryError.message
            }
          })
          .eq('id', summaryRecord.id);
      }
    }

    // Log successful completion
    await supabase.from('cron_job_logs').insert({
      function_name: 'process-weekly-summaries',
      status: 'success',
      message: `Processed ${pendingSummaries.length} weekly summaries`
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: pendingSummaries.length 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in process-weekly-summaries:', error);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await supabase.from('cron_job_logs').insert({
      function_name: 'process-weekly-summaries',
      status: 'error',
      message: `Error: ${error.message}`
    });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

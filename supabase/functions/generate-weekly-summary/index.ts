
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
    const { tenantId } = await req.json();

    // Initialize OpenAI and Supabase clients
    const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get this week's decisions and stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());

    const { data: decisions } = await supabase
      .from('strategies')
      .select('*')
      .eq('tenant_id', tenantId)
      .gte('created_at', weekStart.toISOString());

    const { data: stats } = await supabase
      .from('strategy_approval_stats')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    // Generate AI summary using collected data
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a business intelligence analyst. Generate a concise weekly summary of AI decision-making activities."
        },
        {
          role: "user",
          content: `Generate a weekly summary based on this data:
          - Total decisions this week: ${decisions?.length || 0}
          - AI approval rate: ${stats?.ai_percent || 0}%
          - Human approvals: ${stats?.human_approved || 0}
          - AI approvals: ${stats?.ai_approved || 0}

          Format the summary in markdown with sections for:
          1. Key Metrics
          2. Notable Trends
          3. Recommendations`
        }
      ]
    });

    const summary = response.choices[0].message.content;

    // Store the summary
    const { error } = await supabase
      .from('weekly_ai_summaries')
      .insert({
        tenant_id: tenantId,
        summary,
        week_start: weekStart.toISOString(),
        metadata: { 
          total_decisions: decisions?.length || 0,
          ai_approval_rate: stats?.ai_percent || 0
        }
      });

    if (error) throw error;

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

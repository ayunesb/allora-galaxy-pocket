
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategy_id, execution_log } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!
    });

    const { data: strategy, error: strategyError } = await supabase
      .from("strategies")
      .select("*")
      .eq("id", strategy_id)
      .single();

    if (strategyError) throw strategyError;

    const prompt = `
Strategy failed. Diagnose why.

Strategy Title: ${strategy.title}
Description: ${strategy.description}
Execution Result:
${execution_log}

Respond in JSON:
{
  reason: "...",
  fix: "...",
  affected_kpis: ["..."]
}
`;

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      response_format: { type: "json_object" }
    });

    const diagnosis = JSON.parse(result.choices[0].message.content);

    const { error: updateError } = await supabase
      .from("strategies")
      .update({
        failure_reason: diagnosis.reason,
        diagnosis: diagnosis
      })
      .eq("id", strategy_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ diagnosis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in strategy self-diagnose:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

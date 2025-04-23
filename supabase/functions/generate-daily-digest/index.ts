
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')!
    });
    
    const { logs, metrics, alerts } = await req.json();
    
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a metrics-focused analyst who transforms data into actionable insights."
        },
        { 
          role: "user", 
          content: `Based on yesterday's data:
          
          System Logs: ${logs}
          KPI Metrics: ${metrics}
          Alerts: ${alerts}
          
          Write a founder-facing update that:
          1. Summarizes key metrics changes
          2. Highlights notable AI activity
          3. Identifies alerts requiring attention
          4. Lists new strategies that were generated
          
          Be concise yet comprehensive, focusing on what truly matters.`
        }
      ],
      temperature: 0.4,
    });

    // Count alerts and strategies from the content through basic pattern matching
    const alertCount = (result.choices[0].message.content.match(/alert/gi) || []).length;
    const strategyCount = (result.choices[0].message.content.match(/strateg(y|ies)/gi) || []).length;

    return new Response(
      JSON.stringify({
        summary: result.choices[0].message.content,
        alerts: alertCount,
        strategies: strategyCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-daily-digest function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

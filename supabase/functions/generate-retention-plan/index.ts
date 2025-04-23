
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
    
    const { appDescription, churnCohort } = await req.json();
    
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a customer retention strategy architect."
        },
        { 
          role: "user", 
          content: `For this app: ${appDescription}
          
          Design a retention automation for this churn cohort: ${churnCohort}
          
          Include:
          1. Identified triggers for intervention
          2. Multi-channel touchpoints
          3. Timeline for the win-back campaign
          4. Incentive structure
          5. Success metrics`
        }
      ],
      temperature: 0.7,
    });

    const content = result.choices[0].message.content;
    
    // Extract triggers from the content with simple regex (could be made more robust)
    const triggersSection = content.match(/triggers[^:]*:(.*?)(?=\n\n|\n\d\.)/is)?.[1] || "";
    const triggers = triggersSection.split(/[\n,]/).filter(Boolean).map(item => item.replace(/^\s*[-*•]\s*/, "").trim());
    
    // Extract touchpoints
    const touchpointsSection = content.match(/touchpoints[^:]*:(.*?)(?=\n\n|\n\d\.)/is)?.[1] || "";
    const touchpoints = touchpointsSection.split(/[\n,]/).filter(Boolean).map(item => item.replace(/^\s*[-*•]\s*/, "").trim());
    
    // Extract timeline
    const timelineMatch = content.match(/timeline[^:]*:(.*?)(?=\n\n|\n\d\.)/is);
    const timeline = timelineMatch ? timelineMatch[1].trim() : "7-day winback campaign";

    return new Response(
      JSON.stringify({
        triggers: triggers.length > 0 ? triggers : ["churn risk", "no activity"],
        touchpoints: touchpoints.length > 0 ? touchpoints : ["email", "popup", "offer"],
        timeline: timeline,
        fullPlan: content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-retention-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


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
    
    const { alert, metrics } = await req.json();
    
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a crisis management expert who excels under pressure and delivers results."
        },
        { 
          role: "user", 
          content: `Alert triggered: ${alert}
          
          KPI metrics affected: ${JSON.stringify(metrics)}
          
          Create a recovery plan that includes:
          1. Immediate actions (next 24 hours)
          2. Root cause analysis approach
          3. Timeline for recovery
          4. Crisis messaging for stakeholders
          5. Follow-up measurement plan`
        }
      ],
      temperature: 0.6,
    });

    const content = result.choices[0].message.content;
    
    // Extract actions
    const actionsSection = content.match(/immediate actions[^:]*:(.*?)(?=\n\n|\n\d\.)/is)?.[1] || "";
    const actions = actionsSection.split(/[\n]/).filter(Boolean).map(item => 
      item.replace(/^\s*[-*•\d\.]\s*/, "").trim()
    );
    
    // Extract timeline
    const timelineMatch = content.match(/timeline[^:]*:(.*?)(?=\n\n|\n\d\.)/is);
    const timeline = timelineMatch ? timelineMatch[1].trim() : "72-hour recovery plan";
    
    // Extract messaging
    const messagingMatch = content.match(/messaging[^:]*:(.*?)(?=\n\n|\n\d\.)/is);
    const messaging = messagingMatch ? messagingMatch[1].trim() : "Transparent communication about the issue and resolution plan";

    return new Response(
      JSON.stringify({
        actions: actions.length > 0 ? actions : ["Identify impact", "Assemble response team", "Implement fixes"],
        timeline: timeline,
        messaging: messaging,
        fullPlan: content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-recovery-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

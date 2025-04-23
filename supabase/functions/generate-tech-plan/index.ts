
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
    
    const { productPlan } = await req.json();
    
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a visionary CTO specializing in scalable infrastructure and AI integration."
        },
        { 
          role: "user", 
          content: `Based on this product plan: ${productPlan}
          
          Outline:
          1. The tech stack that will support rapid growth
          2. Systems architecture diagram (in text format)
          3. Integration points with existing systems
          4. Implementation timeline with key milestones`
        }
      ],
      temperature: 0.5,
    });

    // Extract key sections from the response
    const content = result.choices[0].message.content;
    
    // Simple parsing - in a real application you might want more robust parsing
    const stackItems = content.match(/tech stack[^:]*:(.*?)(?=\n\n|\n\d\.|\n#)/is)?.[1]?.split(',').map(item => item.trim()) || [];
    
    // Create a simplified integration map
    const integrationMap = {};
    const timeline = content.match(/timeline[^:]*:(.*?)(?=$)/is)?.[1]?.trim() || "12-week implementation";

    return new Response(
      JSON.stringify({
        stack: stackItems,
        integrationMap: integrationMap,
        timeline: timeline
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-tech-plan function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

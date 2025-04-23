
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
    
    const { product, audience } = await req.json();
    
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You're a world-class CMO. Your expertise is in viral go-to-market strategies and brand intelligence.`
        },
        { 
          role: "user", 
          content: `Product: ${product}\nAudience: ${audience}\nBuild a viral GTM campaign with three phases:
          1. Channel strategy
          2. Messaging approach
          3. Offer structure
          
          Be specific and innovative.`
        }
      ],
      temperature: 0.7,
    });

    return new Response(
      JSON.stringify({
        channel: "multi-channel",
        message: result.choices[0].message.content,
        offer: result.choices[0].message.content.split("Offer structure")[1] || "Custom offer based on audience needs"
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-campaign function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

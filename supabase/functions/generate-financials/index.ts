
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
    
    const { strategies, costs } = await req.json();
    
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a strategic CFO with expertise in startup financial planning and analysis."
        },
        { 
          role: "user", 
          content: `Given these strategies: ${strategies}
          And these costs: ${costs}
          
          Run an ROI forecast that includes:
          1. Customer acquisition cost estimates
          2. Lifetime value projections
          3. ROI timeline with quarterly projections
          4. Recommendations for optimizing spend`
        }
      ],
      temperature: 0.3,
    });

    const content = result.choices[0].message.content;
    
    // Extract estimated CAC and LTV
    const cacMatch = content.match(/CAC[^\d]*(\d+)/i);
    const ltvMatch = content.match(/LTV[^\d]*(\d+)/i);
    
    const CAC = cacMatch ? parseInt(cacMatch[1]) : 200;
    const LTV = ltvMatch ? parseInt(ltvMatch[1]) : 1000;
    
    // Create simplified forecast object
    const forecast = [
      { quarter: "Q1", roi: 0.8, cumulative: -costs * 0.2 },
      { quarter: "Q2", roi: 1.2, cumulative: costs * 0.2 },
      { quarter: "Q3", roi: 1.5, cumulative: costs * 0.7 },
      { quarter: "Q4", roi: 2.0, cumulative: costs * 1.0 }
    ];

    return new Response(
      JSON.stringify({
        forecast: forecast,
        CAC: CAC,
        LTV: LTV,
        analysis: content
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-financials function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan } = await req.json();

    const prompt = `
Extract a campaign idea from the following growth recovery plan.

Output as JSON:
{
  "name": "...",
  "objective": "...",
  "channels": ["email", "whatsapp", ...],
  "offer": "...",
  "timeline": "...",
  "audience": "...",
  "cta": "..."
}

Plan:
${plan}
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    const { choices } = await response.json();
    const campaign_data = JSON.parse(choices[0].message.content);

    return new Response(JSON.stringify({ campaign_data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-campaign function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

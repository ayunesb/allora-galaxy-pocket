
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, tenant_id } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get company and persona data
    const { data: company } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('tenant_id', tenant_id)
      .single();

    const { data: persona } = await supabase
      .from('persona_profiles')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user_id)
      .single();

    if (!company || !persona) {
      throw new Error('Company or persona data not found');
    }

    // Generate strategies using OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a CEO advisor generating growth strategies. Return exactly 3 strategies in JSON format.'
          },
          {
            role: 'user',
            content: `Generate 3 strategies for:
              Company: ${company.name}
              Industry: ${company.industry}
              Team Size: ${company.team_size}
              Goals: ${persona.goal}
              Pain Points: ${persona.pain_points?.join(', ')}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const aiResponse = await response.json();
    const strategies = JSON.parse(aiResponse.choices[0].message.content);

    // Save strategies to database
    const { error: insertError } = await supabase
      .from('strategies')
      .insert(strategies.strategies.map((s: any) => ({
        user_id,
        title: s.title,
        description: s.description,
        tags: s.tags || [],
        status: 'pending'
      })));

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-strategy:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

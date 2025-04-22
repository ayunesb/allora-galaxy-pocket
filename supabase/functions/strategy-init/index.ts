import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenant_id, user_id } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get company and persona profiles
    const { data: company } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('tenant_id', tenant_id)
      .maybeSingle();

    const { data: persona } = await supabase
      .from('persona_profiles')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (!persona || !company) {
      throw new Error('Company or persona profile not found');
    }

    // Generate strategy using OpenAI
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
            content: `You are an AI CEO advisor. Given the company profile and persona, generate a growth strategy and welcome message. 
            Focus on actionable, specific advice that aligns with their industry, goals, and preferred channels.`
          },
          {
            role: 'user',
            content: `Company: ${company.name}
            Industry: ${company.industry}
            Goals: ${persona.goal}
            Channels: ${persona.channels?.join(', ')}
            Tools: ${persona.tools?.join(', ')}
            Pain Points: ${persona.pain_points?.join(', ')}`
          }
        ]
      })
    });

    const aiResponse = await response.json();
    const strategyText = aiResponse.choices[0].message.content;

    // Parse strategy from AI response
    const strategy = {
      title: `Growth Strategy for ${company.name}`,
      description: strategyText,
      welcome: `Welcome ${company.name} team! I'm your AI CEO advisor. I've analyzed your business profile and prepared a custom growth strategy. Here's what I recommend:`,
      confidence: 'High'
    };

    // Save strategy to vault
    const { data: strategyRow, error: strategyError } = await supabase
      .from('vault_strategies')
      .insert({
        tenant_id,
        title: strategy.title,
        description: strategy.description,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (strategyError) throw strategyError;

    // Log welcome message
    await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        user_id,
        event_type: 'welcome_message',
        message: strategy.welcome,
        meta: { strategy_id: strategyRow.id }
      });

    console.log(`Strategy generated for tenant ${tenant_id}`);

    return new Response(
      JSON.stringify({
        strategy_id: strategyRow.id,
        welcome: strategy.welcome,
        confidence: strategy.confidence
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in strategy-init:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

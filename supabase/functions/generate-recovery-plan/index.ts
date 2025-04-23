
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const generateMitigationPrompt = ({ kpi_name, value, target, insight, severity }: any) => `
You are the Growth Strategy Agent for Allora OS.

A new KPI alert has been flagged with severity "${severity}".

KPI: ${kpi_name}
Current Value: ${value}
Target: ${target}
Insight: ${insight}

Your task:
- Analyze why the KPI may be underperforming
- Propose a 3-step recovery strategy
- Include timeline and responsible AI agents or departments
- Suggest automation (campaigns, offers, training, etc.)

Respond only with the recovery plan in markdown.

Example format:
## Recovery Plan: ${kpi_name}
1. ...
2. ...
3. ...

Estimated Time: X days
Assigned Agent: [AgentName]
Automation: [yes/no]
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { insight_id } = await req.json();
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch insight details
    const { data: insight, error: insightError } = await supabaseClient
      .from('kpi_insights')
      .select('*')
      .eq('id', insight_id)
      .single();

    if (insightError) throw new Error(`Error fetching insight: ${insightError.message}`);
    if (!insight) throw new Error('Insight not found');

    // Generate prompt
    const prompt = generateMitigationPrompt(insight);

    // Call OpenAI
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a senior business growth strategist.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const plan = aiData.choices[0].message.content;

    // Update insight with recovery plan
    const { error: updateError } = await supabaseClient
      .from('kpi_insights')
      .update({ suggested_action: plan })
      .eq('id', insight_id);

    if (updateError) throw new Error(`Error updating insight: ${updateError.message}`);

    return new Response(JSON.stringify({ success: true, plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-recovery-plan:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error("Missing OpenAI API key");
    }
    
    const { 
      tenant_id, 
      campaign_name, 
      campaign_description, 
      channels = ['email', 'social'],
      audience = 'general',
      strategy = null
    } = await req.json();
    
    if (!tenant_id || !campaign_name) {
      throw new Error("Missing required parameters: tenant_id and campaign_name");
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get company profile for additional context
    const { data: companyProfile } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('tenant_id', tenant_id)
      .single();
    
    // Build the prompt for OpenAI
    let systemPrompt = `You are a marketing expert specialized in creating ${channels.join(', ')} campaigns. `;
    systemPrompt += `Create a campaign for ${campaign_name} with content for each specified channel. `;
    
    let userPrompt = `Create a marketing campaign with the following details:
- Campaign Name: ${campaign_name}
- Description: ${campaign_description || 'No description provided'}
- Channels: ${channels.join(', ')}
- Target Audience: ${audience}
`;

    if (strategy) {
      userPrompt += `\nThis campaign should align with the following strategy:
- Strategy Title: ${strategy.title}
- Strategy Description: ${strategy.description}
- Industry: ${strategy.industry || 'Not specified'}
- Goal: ${strategy.goal || 'Not specified'}
`;
    }

    if (companyProfile) {
      userPrompt += `\nThe campaign is for a company with these characteristics:
- Company Name: ${companyProfile.name}
- Industry: ${companyProfile.industry}
- Company Size: ${companyProfile.team_size}
`;
    }

    userPrompt += `\nFor each channel, provide:
1. A compelling headline or subject line
2. The main content
3. A clear call-to-action

Return only JSON in this format without any additional explanation:
{
  "name": "Campaign Name",
  "description": "Campaign Description",
  "scripts": [
    {
      "channel": "email",
      "headline": "Email Subject Line",
      "content": "Email content...",
      "cta": "Call to action"
    },
    ...
  ]
}`;

    // Call OpenAI to generate the campaign content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    let campaignData;
    
    try {
      // Parse the response as JSON
      campaignData = JSON.parse(data.choices[0].message.content);
    } catch (e) {
      // If parsing fails, use the raw text as is
      console.error("Error parsing OpenAI response:", e);
      campaignData = {
        name: campaign_name,
        description: campaign_description || "Generated campaign",
        scripts: channels.map(channel => ({
          channel,
          content: data.choices[0].message.content,
          headline: "Generated Content",
          cta: "Learn More"
        }))
      };
    }

    // Log this action to system logs
    await supabase.from('system_logs').insert({
      tenant_id,
      event_type: 'CAMPAIGN_GENERATION',
      message: `Campaign "${campaign_name}" generated successfully`,
      meta: { channels }
    });

    return new Response(JSON.stringify(campaignData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating campaign:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

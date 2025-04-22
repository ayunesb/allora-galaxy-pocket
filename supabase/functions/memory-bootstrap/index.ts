
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function generateEmbedding(text: string): Promise<number[]> {
  const openAIKey = Deno.env.get('OPENAI_API_KEY')!;
  
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text
    })
  });

  const { data } = await response.json();
  return data[0].embedding;
}

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

    // Get persona profile
    const { data: profile, error: profileError } = await supabase
      .from('persona_profiles')
      .select('goal, tone, pain_points, tools, channels')
      .eq('tenant_id', tenant_id)
      .eq('user_id', user_id)
      .single();

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError);
      return new Response(
        JSON.stringify({ error: 'No profile found' }), 
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Format content for embedding
    const content = `
      Goal: ${profile.goal || ''}
      Pain Points: ${profile.pain_points?.join(', ') || ''}
      Tone: ${profile.tone || ''}
      Tools: ${profile.tools?.join(', ') || ''}
      Channels: ${profile.channels?.join(', ') || ''}
    `.trim();

    // Generate embedding
    const embedding = await generateEmbedding(content);

    // Store in ai_memory
    const { error: insertError } = await supabase
      .from('ai_memory')
      .insert({
        tenant_id,
        user_id,
        content,
        embedding
      });

    if (insertError) {
      console.error('Memory insert error:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ status: 'Memory bootstrapped successfully' }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Bootstrap error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

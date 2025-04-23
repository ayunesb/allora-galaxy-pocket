
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://lxsuqqlfuftnvuvtctsx.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4c3VxcWxmdWZ0bnZ1dnRjdHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzA5OTgsImV4cCI6MjA1OTcwNjk5OH0.umJfetR46M11PJZtIN9CCURPkp3JK6tn_17KMMjC3ks";
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { data: submissions } = await supabase
      .from('agent_memory')
      .select('*')
      .eq('is_user_submitted', true)
      .is('ai_rating', null);

    if (!submissions?.length) {
      return new Response(JSON.stringify({ message: 'No submissions to grade' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    for (const memory of submissions) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are the Allora Academy AI Reviewer. Rate user-submitted insights from 1-5 based on originality, usefulness, and clarity. Return only JSON.'
            },
            {
              role: 'user',
              content: `Rate this insight: "${memory.context}"`
            }
          ]
        })
      });

      const result = await response.json();
      const aiResponse = JSON.parse(result.choices[0].message.content);

      await supabase
        .from('agent_memory')
        .update({
          ai_rating: aiResponse.ai_rating,
          ai_feedback: aiResponse.ai_feedback
        })
        .eq('id', memory.id);

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return new Response(JSON.stringify({ message: `Graded ${submissions.length} submissions` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in grade-user-submissions:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { profile, userId, tenantId } = await req.json()

    // Save company profile
    await supabase
      .from('company_profiles')
      .upsert({
        tenant_id: tenantId,
        name: profile.companyName,
        industry: profile.industry,
        team_size: profile.teamSize,
        revenue_tier: profile.revenue,
        launch_mode: profile.launch_mode
      })

    // Save persona profile
    await supabase
      .from('persona_profiles')
      .upsert({
        tenant_id: tenantId,
        user_id: userId,
        goal: profile.goals?.join(', '),
        tone: profile.tone,
        pain_points: profile.challenges,
        tools: profile.tools,
        channels: profile.channels,
        sell_type: profile.sellType
      })

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    )
  }
})

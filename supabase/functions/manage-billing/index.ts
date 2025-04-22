
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    const { action, user_id, amount, plan } = await req.json()
    
    switch (action) {
      case 'create_profile': {
        // Create billing profile for a new user
        const { data, error } = await supabase
          .from('billing_profiles')
          .insert({
            user_id,
            plan: plan || 'standard',
            credits: 100, // Default starting credits
          })
          .select()
          .single()
        
        if (error) throw error
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      case 'add_credits': {
        // Add credits to a user's account
        if (!amount || amount <= 0) {
          throw new Error('Invalid credit amount')
        }
        
        const { data, error } = await supabase.rpc('add_billing_credits', {
          p_user_id: user_id,
          p_amount: amount
        })
        
        if (error) throw error
        return new Response(JSON.stringify({ success: true, credits_added: amount }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      case 'use_credits': {
        // Use credits (deduct from the user's account)
        if (!amount || amount <= 0) {
          throw new Error('Invalid credit amount')
        }
        
        const { data, error } = await supabase.rpc('use_billing_credits', {
          p_user_id: user_id,
          p_amount: amount
        })
        
        if (error) throw error
        return new Response(JSON.stringify({ success: true, credits_used: amount }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      case 'update_plan': {
        if (!plan) {
          throw new Error('No plan specified')
        }
        
        const { data, error } = await supabase
          .from('billing_profiles')
          .update({ plan })
          .eq('user_id', user_id)
          .select()
          .single()
        
        if (error) throw error
        return new Response(JSON.stringify({ success: true, data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error processing request:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

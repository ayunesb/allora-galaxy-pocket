
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
    // Create database functions for billing credit operations
    const createAddCreditsFunction = `
      CREATE OR REPLACE FUNCTION add_billing_credits(p_user_id UUID, p_amount INT)
      RETURNS VOID AS $$
      BEGIN
        INSERT INTO billing_profiles (user_id, credits, plan)
        VALUES (p_user_id, p_amount, 'standard')
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          credits = billing_profiles.credits + p_amount,
          updated_at = NOW();
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    const createUseCreditsFunction = `
      CREATE OR REPLACE FUNCTION use_billing_credits(p_user_id UUID, p_amount INT)
      RETURNS BOOLEAN AS $$
      DECLARE
        available_credits INT;
      BEGIN
        -- Get current credits
        SELECT credits INTO available_credits
        FROM billing_profiles
        WHERE user_id = p_user_id;
        
        -- Check if enough credits
        IF available_credits >= p_amount THEN
          -- Update credits
          UPDATE billing_profiles
          SET 
            credits = credits - p_amount,
            updated_at = NOW()
          WHERE user_id = p_user_id;
          
          RETURN TRUE;
        ELSE
          RETURN FALSE;
        END IF;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
    
    // Execute the function creation SQL
    await supabase.sql(createAddCreditsFunction)
    await supabase.sql(createUseCreditsFunction)
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Database functions created successfully" 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
    
  } catch (error) {
    console.error('Error setting up database functions:', error)
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

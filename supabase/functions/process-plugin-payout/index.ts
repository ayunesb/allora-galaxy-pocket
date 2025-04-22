import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@15.3.0";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16'
    });

    // Fetch latest plugin sale
    const { data: sales, error: salesError } = await supabase
      .from('plugin_sales')
      .select('plugin_id, price')
      .order('purchased_at', { ascending: false })
      .limit(1)
      .single();

    if (salesError) throw salesError;

    // Fetch plugin creator details
    const { data: creator, error: creatorError } = await supabase
      .from('plugin_creators')
      .select('stripe_connect_id, payout_percentage')
      .eq('plugin_id', sales.plugin_id)
      .single();

    if (creatorError) throw creatorError;

    // Calculate payout amount (platform keeps 30%)
    const payoutAmount = Math.floor(
      (sales.price * (creator.payout_percentage / 100)) * 100
    );

    // Create Stripe transfer to plugin creator
    if (creator.stripe_connect_id) {
      await stripe.transfers.create({
        amount: payoutAmount,
        currency: 'usd',
        destination: creator.stripe_connect_id,
      });
    }

    return new Response(
      JSON.stringify({ success: true, payoutAmount }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

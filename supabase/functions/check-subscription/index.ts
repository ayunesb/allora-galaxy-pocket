
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
    const { subscription_id } = await req.json();

    if (!subscription_id) {
      return new Response(JSON.stringify({ error: "Missing subscription ID" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    });

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscription_id);

    // Format response with relevant subscription data
    const subscriptionData = {
      id: subscription.id,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      plan: {
        id: subscription.items.data[0]?.plan.id,
        name: subscription.items.data[0]?.plan.nickname || 'Standard Plan',
        amount: subscription.items.data[0]?.plan.amount,
        currency: subscription.items.data[0]?.plan.currency,
        interval: subscription.items.data[0]?.plan.interval
      },
      customer: subscription.customer,
      payment_method: subscription.default_payment_method
    };

    // Log the check in system logs
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    await supabase.from('system_logs').insert({
      event_type: 'SUBSCRIPTION_CHECK',
      message: `Checked subscription status for ${subscription_id}`,
      meta: {
        subscription_id,
        status: subscription.status
      },
      tenant_id: subscription.metadata?.tenant_id || null
    });

    return new Response(JSON.stringify(subscriptionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error checking subscription:', error);
    
    return new Response(JSON.stringify({ 
      error: "Failed to check subscription status",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

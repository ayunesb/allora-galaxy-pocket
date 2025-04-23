
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
    // Get the Stripe signature from headers
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response(JSON.stringify({ error: 'No signature provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    });

    // Get the raw request body for webhook signature verification
    const requestText = await req.text();
    
    // Verify Stripe webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        requestText,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: `Webhook Error: ${err.message}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle invoice.paid event
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      if (!customerId) {
        return new Response(JSON.stringify({ error: 'No customer ID in invoice' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Find the billing profile by Stripe customer ID
      const { data: profile, error: profileError } = await supabase
        .from('billing_profiles')
        .select('id, user_id, plan, credits')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profileError || !profile) {
        console.error('Error finding billing profile:', profileError);
        return new Response(JSON.stringify({ error: 'Billing profile not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get plan details to determine credit amount
      // For this example, we'll use the existing credits value as the monthly allocation
      const monthlyCredits = profile.credits;
      
      // Call the database function to reset credits
      const { data: resetResult, error: resetError } = await supabase.rpc(
        'reset_billing_credits',
        { p_user_id: profile.user_id, p_credits: monthlyCredits }
      );

      if (resetError) {
        console.error('Error resetting credits:', resetError);
        return new Response(JSON.stringify({ error: 'Failed to reset credits' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Log the credits reset in system_logs
      await supabase
        .from('system_logs')
        .insert({
          tenant_id: profile.user_id,
          event_type: 'credits_reset',
          message: `Credits reset to ${monthlyCredits} due to invoice payment`,
          meta: {
            invoice_id: invoice.id,
            stripe_customer_id: customerId,
            plan: profile.plan,
            credits: monthlyCredits
          }
        });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Credits successfully reset',
        user_id: profile.user_id,
        credits: monthlyCredits
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return a 200 response for other event types
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

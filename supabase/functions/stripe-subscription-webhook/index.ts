
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@15.3.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature"
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify webhook signature
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new Response("Missing webhook secret", { status: 500, headers: corsHeaders });
  }

  // Get the raw body
  let body: Uint8Array;
  if (typeof req.arrayBuffer === "function") {
    body = new Uint8Array(await req.arrayBuffer());
  } else {
    return new Response("Missing arrayBuffer support in request", { status: 400, headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-08-16" });
  const sig = req.headers.get('stripe-signature') || "";

  try {
    const event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    console.log("Received Stripe event:", event.type);

    if (event.type === "invoice.paid") {
      const subscription = event.data.object as any;
      const customerId = subscription.customer;

      // Get customer email from Stripe
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer || customer.deleted) {
        throw new Error("Customer not found or deleted");
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Call the reset credits function
      await supabase.rpc('reset_billing_credits');

      // Log the credit reset
      const { data: userData } = await supabase
        .from('billing_profiles')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (userData) {
        await supabase.from('credit_logs').insert({
          user_id: userData.user_id,
          amount: subscription.amount_paid / 100, // Convert from cents
          type: 'reset',
          created_at: new Date().toISOString()
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new Response(`Webhook Error: ${err.message}`, {
      status: 400,
      headers: corsHeaders
    });
  }
});

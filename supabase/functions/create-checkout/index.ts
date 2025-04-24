
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Parse request body
    let plan = 'standard';
    try {
      const body = await req.json();
      if (body?.plan) {
        plan = body.plan;
      }
    } catch (e) {
      console.log("No plan specified in request body, using default");
    }

    // Set pricing based on plan
    let unitAmount;
    switch (plan) {
      case 'growth':
        unitAmount = 1999;
        break;
      case 'pro':
        unitAmount = 4999;
        break;
      default: // standard
        unitAmount = 799;
        break;
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Subscription`,
              description: `Allora OS ${plan} plan with credits and features`
            },
            unit_amount: unitAmount,
            recurring: { interval: "month" }
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        tenant_id: user.id,
        plan: plan
      },
      success_url: `${req.headers.get("origin")}/billing?success=true`,
      cancel_url: `${req.headers.get("origin")}/billing?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in create-checkout:", error);
    return new Response(JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

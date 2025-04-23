
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

  // Stripe requires the raw body for verification
  let body: Uint8Array;
  if (typeof req.arrayBuffer === "function") {
    body = new Uint8Array(await req.arrayBuffer());
  } else {
    return new Response("Missing arrayBuffer support in request", { status: 400, headers: corsHeaders });
  }

  // Get headers and Stripe secrets
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return new Response("Missing Stripe secrets", { status: 500, headers: corsHeaders });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-08-16" });
  const sig = req.headers.get('stripe-signature') || "";

  try {
    // Validate event signature
    const event = stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);

    if (event.type === "transfer.paid") {
      const transfer = event.data.object as any;
      const pluginId = transfer.metadata?.plugin_id;

      if (pluginId) {
        // Use Supabase Service Role Key for write permissions
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Update plugin earnings
        const earnings = transfer.amount / 100;
        await supabase.from("plugin_submissions")
          .update({ earnings })
          .eq("id", pluginId);

        return new Response(JSON.stringify({ ok: true, earnings }), { status: 200, headers: corsHeaders });
      }
    }

    return new Response("ok", { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("[Stripe Webhook Error]", err);
    return new Response("Invalid webhook", { status: 400, headers: corsHeaders });
  }
});

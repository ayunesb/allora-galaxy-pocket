
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
    const { tenant_id, credits_used, timestamp } = await req.json();
    
    if (!tenant_id || !credits_used) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get tenant's stripe subscription item ID
    const { data: billingData, error: billingError } = await supabase
      .from('billing_profiles')
      .select('stripe_subscription_item_id')
      .eq('user_id', tenant_id)
      .single();

    if (billingError || !billingData?.stripe_subscription_item_id) {
      console.error("Error fetching billing profile or no subscription item ID:", billingError);
      return new Response(JSON.stringify({ error: "No subscription found for tenant" }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Report usage to Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    });

    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      billingData.stripe_subscription_item_id,
      {
        quantity: credits_used,
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        action: 'increment'
      }
    );

    // Log the usage report in system_logs
    await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        event_type: 'stripe_usage_report',
        message: `Reported ${credits_used} credits to Stripe`,
        meta: {
          subscription_item_id: billingData.stripe_subscription_item_id,
          usage_record_id: usageRecord.id,
          credits_used
        }
      });

    return new Response(JSON.stringify({ success: true, usage_record: usageRecord }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error reporting usage to Stripe:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

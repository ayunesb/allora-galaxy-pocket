
// Complete the stripe-usage-reporter function to report usage to Stripe

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@15.3.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request parameters
    const { tenant_id, credits_used, timestamp } = await req.json();
    
    if (!tenant_id || credits_used === undefined) {
      throw new Error("Missing required parameters");
    }
    
    console.log(`Reporting ${credits_used} credits for tenant ${tenant_id}`);
    
    // Get the billing profile for the tenant
    const { data: billing, error: billingError } = await supabase
      .from('billing_profiles')
      .select('stripe_subscription_item_id')
      .eq('user_id', tenant_id)
      .single();
    
    if (billingError || !billing?.stripe_subscription_item_id) {
      console.error("No subscription item found:", billingError);
      return new Response(JSON.stringify({ 
        error: "No active subscription item found for tenant",
        details: billingError?.message 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    });
    
    // Report usage to Stripe
    const usageRecord = await stripe.subscriptionItems.createUsageRecord(
      billing.stripe_subscription_item_id,
      {
        quantity: credits_used,
        timestamp: timestamp || Math.floor(Date.now() / 1000),
        action: 'increment'
      }
    );
    
    console.log(`Reported usage to Stripe: ${JSON.stringify(usageRecord)}`);
    
    // Log the usage in our system
    await supabase
      .from('stripe_usage_reports')
      .insert({
        tenant_id,
        subscription_item_id: billing.stripe_subscription_item_id,
        credits_used,
        status: 'success',
        stripe_usage_record_id: usageRecord.id
      });
    
    // Log the action
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'stripe-usage-reporter',
        status: 'success',
        message: `Reported ${credits_used} credits for tenant ${tenant_id}`,
        meta: { tenant_id, credits_used, usage_record_id: usageRecord.id }
      });
    
    return new Response(
      JSON.stringify({ success: true, usage_record_id: usageRecord.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in stripe-usage-reporter:", error.message);
    
    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'stripe-usage-reporter',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

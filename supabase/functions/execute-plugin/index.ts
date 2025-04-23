
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

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
    const {
      plugin_key,
      operation,
      config,
      data,
      strategy,
      tenant_id
    } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, verify the plugin is enabled
    const { data: pluginData, error: pluginError } = await supabase
      .from("tenant_plugins")
      .select("enabled")
      .eq("tenant_id", tenant_id)
      .eq("plugin_key", plugin_key)
      .single();

    if (pluginError || !pluginData?.enabled) {
      return new Response(
        JSON.stringify({ error: `Plugin ${plugin_key} is not enabled or does not exist` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Log the operation in plugin_usage_logs
    await supabase.from("plugin_usage_logs").insert({
      tenant_id,
      plugin_key,
      event: `execute_${operation}`,
      event_type: "api",
      count: 1
    });

    let result;
    
    // Implement plugin-specific operations
    switch (plugin_key) {
      case "ga4":
        if (operation === "fetch_analytics") {
          // Implement GA4 analytics fetching using config
          result = { message: "GA4 analytics would be fetched here" };
        }
        break;
        
      case "stripe":
        if (operation === "create_customer") {
          // Implement Stripe customer creation
          result = { message: "Stripe customer would be created here", customer_id: "cus_mock123" };
        } else if (operation === "create_checkout") {
          // Redirect to checkout
          result = { 
            message: "Checkout session created", 
            checkout_url: "https://checkout.stripe.com/example"
          };
        }
        break;
        
      case "hubspot":
        if (operation === "sync_contacts") {
          // Implement HubSpot contact sync
          result = { message: "HubSpot contacts would sync here", synced: 5 };
        }
        break;
        
      default:
        // For unknown plugins, check if there's a custom edge function
        try {
          const response = await fetch(
            `${supabaseUrl}/functions/v1/plugin-${plugin_key}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`
              },
              body: JSON.stringify({
                operation,
                config,
                data,
                strategy,
                tenant_id
              })
            }
          );
          
          if (!response.ok) {
            throw new Error(`Plugin function returned ${response.status}`);
          }
          
          result = await response.json();
          
        } catch (err) {
          return new Response(
            JSON.stringify({ error: `Unsupported plugin: ${plugin_key}` }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          );
        }
    }

    // Log successful execution
    await supabase.from("plugin_usage_logs").insert({
      tenant_id,
      plugin_key,
      event: `${operation}_success`,
      event_type: "success",
      count: 1
    });

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
    );
    
  } catch (error) {
    console.error('Plugin execution error:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

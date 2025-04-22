
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { message, type, channel = "slack" } = await req.json();
    
    // Get the appropriate webhook URL from environment variables
    const webhookUrl = channel === "slack" 
      ? Deno.env.get("SLACK_WEBHOOK_URL")
      : Deno.env.get("DISCORD_WEBHOOK_URL");

    if (!webhookUrl) {
      throw new Error(`No webhook URL configured for ${channel}`);
    }
    
    // Format the message based on the notification type
    let formattedMessage = '';
    
    if (type === 'strategy_approval') {
      formattedMessage = `🟢 *Strategy Approved*: ${message}`;
    } else if (type === 'strategy_declined') {
      formattedMessage = `🔴 *Strategy Declined*: ${message}`;
    } else if (type === 'campaign_launched') {
      formattedMessage = `🚀 *Campaign Launched*: ${message}`;
    } else if (type === 'roi_milestone') {
      formattedMessage = `📈 *ROI Milestone*: ${message}`;
    } else {
      formattedMessage = `ℹ️ *${type || 'Notification'}*: ${message}`;
    }

    // Create the appropriate payload format for Slack or Discord
    const payload = channel === "slack"
      ? { text: formattedMessage }
      : { content: formattedMessage };

    // Send the webhook request
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("[Webhook Notification Error]", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

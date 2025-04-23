
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, changed_by, new_role } = await req.json();

    // Compose Slack message
    const message = {
      text: `🧠 Role Change Detected:\nUser: ${user_id}\nChanged By: ${changed_by}\nNew Role: ${new_role}`
    };

    const slackWebhook = Deno.env.get("SLACK_WEBHOOK_URL");
    if (!slackWebhook) {
      throw new Error("SLACK_WEBHOOK_URL is not configured.");
    }

    const response = await fetch(slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error(`Slack webhook error: ${response.statusText}`);
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Role Change Webhook Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export async function sendSlackAlert(functionName: string, errorMessage: string) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const slackWebhookUrl = Deno.env.get('ADMIN_SLACK_WEBHOOK') || '';

  if (!slackWebhookUrl) {
    console.error('No Slack webhook URL configured');
    return;
  }

  const message = `🚨 CRON job failed: *${functionName}*\nError: \`${errorMessage}\`\nTime: ${new Date().toISOString()}`;

  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message })
    });

    if (!response.ok) {
      console.error('Failed to send Slack alert', await response.text());
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}

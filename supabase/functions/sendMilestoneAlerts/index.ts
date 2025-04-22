
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

async function getNewMilestones() {
  const { data, error } = await supabase
    .from('vault_strategies')
    .select('*, company_profiles(name)')
    .eq('status', 'approved')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  if (error) {
    console.error('Error fetching milestones:', error);
    throw error;
  }

  return data;
}

async function sendSlackAlert(milestones: any[]) {
  if (!milestones.length) return;

  const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  if (!slackWebhookUrl) {
    console.error('Slack webhook URL not configured');
    return;
  }

  const milestoneText = milestones.map(m => 
    `🚀 *${m.title}* ${m.company_profiles?.name ? `- ${m.company_profiles.name}` : ''}`
  ).join('\n');

  try {
    const response = await fetch(slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🎉 *New Milestone Achievements* 🎉\n\n${milestoneText}`
      })
    });

    if (!response.ok) {
      throw new Error(`Slack alert failed: ${response.statusText}`);
    }

    // Log each milestone in the milestone_alert_logs table
    const logEntries = milestones.map(m => ({
      strategy_id: m.id,
      title: m.title,
      status: 'sent'
    }));

    const { error: logError } = await supabase
      .from('milestone_alert_logs')
      .insert(logEntries);

    if (logError) {
      console.error('Error logging milestones:', logError);
    }
  } catch (error) {
    console.error('Error sending Slack alert:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting milestone check...');
    const milestones = await getNewMilestones();
    console.log(`Found ${milestones.length} new milestones`);

    if (milestones.length > 0) {
      await sendSlackAlert(milestones);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${milestones.length} milestones` 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in milestone alert function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

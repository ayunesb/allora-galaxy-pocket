
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "@supabase/supabase-js";
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

async function sendEmailAlert(milestones: any[]) {
  if (!milestones.length) return;

  const htmlContent = `
    <h1>Weekly Milestone Report</h1>
    <p>Here are the strategies that were approved in the last 7 days:</p>
    <ul>
      ${milestones.map(m => `
        <li>
          <strong>${m.title}</strong>
          ${m.company_profiles?.name ? ` - ${m.company_profiles.name}` : ''}
          <br>
          <em>${m.description || 'No description provided'}</em>
        </li>
      `).join('')}
    </ul>
  `;

  try {
    await resend.emails.send({
      from: 'Allora OS <onboarding@resend.dev>',
      to: ['admin@allora.dev'],
      subject: `🎯 ${milestones.length} New Milestone${milestones.length > 1 ? 's' : ''} Achieved!`,
      html: htmlContent,
    });
    
    console.log(`Successfully sent email for ${milestones.length} milestones`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
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
      await sendEmailAlert(milestones);
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

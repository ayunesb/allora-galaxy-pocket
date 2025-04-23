
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { decode } from "https://deno.land/std@0.177.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // If this is a scheduled invocation, body will be empty
    // If it's a direct API call, we might have a tenant_id
    let tenant_id: string | undefined;
    
    try {
      const body = await req.json();
      tenant_id = body.tenant_id;
    } catch {
      // This is likely a scheduled invocation without a body
      console.log("No request body, assuming scheduled invocation");
    }

    // Process all tenants if no specific tenant_id provided
    if (!tenant_id) {
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenant_profiles')
        .select('id');

      if (tenantsError) {
        throw new Error('Failed to fetch tenants: ' + tenantsError.message);
      }

      const results = [];
      
      for (const tenant of tenants || []) {
        try {
          const result = await processGa4Metrics(supabase, tenant.id);
          results.push(result);
        } catch (tenantError) {
          console.error(`Error processing tenant ${tenant.id}:`, tenantError);
          
          // Log failure for this tenant
          await supabase
            .from('cron_job_logs')
            .insert({
              function_name: 'fetch-ga4-metrics',
              status: 'error',
              message: `Error processing tenant ${tenant.id}: ${tenantError.message}`
            });
        }
      }

      // Log overall success
      await supabase
        .from('cron_job_logs')
        .insert({
          function_name: 'fetch-ga4-metrics',
          status: 'success',
          message: `Processed ${results.length} tenants successfully`
        });

      return new Response(
        JSON.stringify({ success: true, processed: results.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Process single tenant
      const result = await processGa4Metrics(supabase, tenant_id);
      
      return new Response(
        JSON.stringify(result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('GA4 Metrics Fetch Error:', error);
    
    // Log the overall function failure
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'fetch-ga4-metrics',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    // Try to send Slack alert if configured
    try {
      await sendSlackAlert('fetch-ga4-metrics', error.message);
    } catch (slackError) {
      console.error('Failed to send Slack alert:', slackError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function processGa4Metrics(supabase, tenant_id: string) {
  // Fetch GA4 configuration
  const { data: ga4Config, error: configError } = await supabase
    .from('ga4_configs')
    .select('property_id')
    .eq('tenant_id', tenant_id)
    .single();

  if (configError || !ga4Config) {
    throw new Error(`GA4 configuration not found for tenant ${tenant_id}`);
  }

  // Fetch encrypted token
  const { data: tokenData, error: tokenError } = await supabase
    .from('encrypted_tokens')
    .select('encrypted_token')
    .eq('tenant_id', tenant_id)
    .eq('service', 'GA4')
    .single();

  if (tokenError || !tokenData) {
    throw new Error(`GA4 token not found for tenant ${tenant_id}`);
  }

  // Decrypt token (this is a simplified version, in production you'd use proper decryption)
  // In the real function, this would use the crypto APIs with the ENCRYPTION_SECRET
  const decryptedToken = new TextDecoder().decode(
    decode(tokenData.encrypted_token)
  );

  // Fetch GA4 metrics including MQL events
  const ga4Res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${ga4Config.property_id}:runReport`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${decryptedToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'sessions' },
          { name: 'bounceRate' },
          { name: 'eventCount' },
          { name: 'userEngagementDuration' }
        ],
        dimensions: [{ name: 'eventName' }],
      }),
    }
  );

  if (!ga4Res.ok) {
    throw new Error(`Failed to fetch GA4 metrics: ${ga4Res.statusText}`);
  }

  const metricsData = await ga4Res.json();

  // Extract and format metrics
  const metrics = {};
  let mqlCount = 0;
  
  // Process each row of data
  metricsData.rows?.forEach(row => {
    const eventName = row.dimensionValues[0].value;
    const eventCount = Number(row.metricValues[2].value);
    
    // Special handling for MQL (generate_lead) events
    if (eventName === 'generate_lead') {
      mqlCount = eventCount;
    }
    
    // Add metric to the collection
    metrics[eventName] = eventCount;
  });
  
  // Extract standard metrics
  const sessions = metrics['session_start'] || 0;
  const bounceRate = Number(metricsData.rows?.[0]?.metricValues?.[1]?.value) || 0;
  const userEngagement = Number(metricsData.rows?.[0]?.metricValues?.[3]?.value) || 0;

  // Store metrics in KPI table
  const timestamp = new Date().toISOString();
  
  // Insert GA4 session metrics
  const { error: sessionsError } = await supabase.from('kpi_metrics').upsert([
    { 
      tenant_id, 
      metric: 'GA4 Sessions', 
      value: Number(sessions),
      recorded_at: timestamp
    }
  ]);

  if (sessionsError) {
    console.error('Error storing Session metrics:', sessionsError);
  }
  
  // Insert bounce rate metrics
  const { error: bounceError } = await supabase.from('kpi_metrics').upsert([
    { 
      tenant_id, 
      metric: 'Bounce Rate', 
      value: Number(bounceRate),
      recorded_at: timestamp
    }
  ]);

  if (bounceError) {
    console.error('Error storing Bounce Rate metrics:', bounceError);
  }
  
  // Insert MQL metrics
  const { error: mqlError } = await supabase.from('kpi_metrics').upsert([
    {
      tenant_id,
      metric: 'Qualified Leads (7d)',
      value: Number(mqlCount),
      recorded_at: timestamp
    }
  ]);

  if (mqlError) {
    console.error('Error storing MQL metrics:', mqlError);
  }
  
  // Insert user engagement metrics
  const { error: engagementError } = await supabase.from('kpi_metrics').upsert([
    {
      tenant_id,
      metric: 'User Engagement',
      value: Number(userEngagement),
      recorded_at: timestamp
    }
  ]);

  if (engagementError) {
    console.error('Error storing User Engagement metrics:', engagementError);
  }

  // Log success in cron job logs
  await supabase.from('cron_job_logs').insert({
    function_name: 'fetch-ga4-metrics',
    status: 'success',
    message: `Processed GA4 metrics for tenant ${tenant_id}: ${mqlCount} MQLs, ${sessions} sessions`
  });

  return { 
    tenant_id, 
    sessions, 
    bounceRate, 
    mqlCount, 
    userEngagement
  };
}

async function sendSlackAlert(functionName: string, errorMessage: string) {
  const slackWebhookUrl = Deno.env.get('SLACK_WEBHOOK_URL');
  if (!slackWebhookUrl) {
    console.log('No Slack webhook URL configured, skipping alert');
    return;
  }

  const message = `🚨 CRON job failed: *${functionName}*\nError: \`${errorMessage}\`\nTime: ${new Date().toISOString()}`;

  await fetch(slackWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message })
  });
}

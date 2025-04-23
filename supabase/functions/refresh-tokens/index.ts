
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts"
import { encode as base64Encode } from "https://deno.land/std@0.177.0/encoding/base64.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_SECRET')!

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

    // Get tokens that need refreshing
    const now = new Date();
    const { data: tokens, error: tokensError } = await supabase
      .from('encrypted_tokens')
      .select('*')
      .lt('expires_at', now.toISOString()) // Get expired tokens
      .not('refresh_token', 'is', null) // Only get tokens with refresh tokens

    if (tokensError) {
      throw new Error(`Failed to fetch tokens: ${tokensError.message}`);
    }

    console.log(`Found ${tokens?.length || 0} tokens to refresh`);

    // Track refresh results
    const results = {
      success: 0,
      failed: 0,
      services: {} as Record<string, { success: number; failed: number }>
    };

    // Process each token
    for (const token of tokens || []) {
      try {
        // Initialize service counter if needed
        if (!results.services[token.service]) {
          results.services[token.service] = { success: 0, failed: 0 };
        }

        // Refresh the token based on service
        const refreshed = await refreshToken(token.service, token.refresh_token, token.tenant_id);
        
        if (refreshed.success) {
          // Update the token in the database
          const { error: updateError } = await supabase
            .from('encrypted_tokens')
            .update({
              encrypted_token: await encryptToken(refreshed.access_token),
              refresh_token: refreshed.refresh_token ? await encryptToken(refreshed.refresh_token) : token.refresh_token,
              expires_at: new Date(Date.now() + (refreshed.expires_in * 1000)).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', token.id);

          if (updateError) {
            throw new Error(`Failed to update token: ${updateError.message}`);
          }

          results.success++;
          results.services[token.service].success++;
        } else {
          throw new Error(refreshed.error || 'Unknown error refreshing token');
        }
      } catch (tokenError) {
        console.error(`Error refreshing token for service ${token.service}, tenant ${token.tenant_id}:`, tokenError);
        
        results.failed++;
        results.services[token.service].failed++;
        
        // Log the error
        await supabase
          .from('cron_job_logs')
          .insert({
            function_name: 'refresh-tokens',
            status: 'error',
            message: `Failed to refresh ${token.service} token for tenant ${token.tenant_id}: ${tokenError.message}`
          });
      }
    }

    // Log overall success
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'refresh-tokens',
        status: results.failed > 0 ? 'partial' : 'success',
        message: `Refreshed ${results.success} tokens successfully, ${results.failed} failed`
      });

    // If any failures, send an alert
    if (results.failed > 0) {
      try {
        await sendSlackAlert('refresh-tokens', 
          `${results.failed} token refresh operations failed. Check logs for details.`);
      } catch (alertError) {
        console.error('Failed to send Slack alert:', alertError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    
    // Log the overall function failure
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    
    await supabase
      .from('cron_job_logs')
      .insert({
        function_name: 'refresh-tokens',
        status: 'error',
        message: `Error: ${error.message}`
      });
    
    // Try to send Slack alert if configured
    try {
      await sendSlackAlert('refresh-tokens', error.message);
    } catch (slackError) {
      console.error('Failed to send Slack alert:', slackError);
    }
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function encryptToken(text: string): Promise<string> {
  const encodedText = new TextEncoder().encode(text)
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(ENCRYPTION_KEY),
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encodedText
  )
  const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength)
  encryptedArray.set(iv)
  encryptedArray.set(new Uint8Array(encryptedData), iv.length)
  return base64Encode(encryptedArray)
}

interface RefreshResult {
  success: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
}

async function refreshToken(service: string, encryptedRefreshToken: string, tenant_id: string): Promise<RefreshResult> {
  // This would need to be implemented per service
  // Here's a simplified example for common OAuth2 refresh flows
  
  switch (service) {
    case 'GA4':
      return refreshGoogleToken(encryptedRefreshToken);
    case 'HUBSPOT':
      return refreshHubspotToken(encryptedRefreshToken);
    default:
      throw new Error(`Unsupported service: ${service}`);
  }
}

async function refreshGoogleToken(encryptedRefreshToken: string): Promise<RefreshResult> {
  // In real implementation, decrypt the refresh token first
  // This is a placeholder - in production you'd use the refresh token to get a new access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: Deno.env.get('GOOGLE_CLIENT_ID') || '',
      client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '',
      refresh_token: 'DECRYPTED_REFRESH_TOKEN_WOULD_GO_HERE',
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to refresh Google token: ${error}`);
  }

  const data = await response.json();
  
  return {
    success: true,
    access_token: data.access_token,
    refresh_token: data.refresh_token, // Note: Google might not always return a new refresh token
    expires_in: data.expires_in || 3600
  };
}

async function refreshHubspotToken(encryptedRefreshToken: string): Promise<RefreshResult> {
  // Similar implementation for Hubspot would go here
  // Using a mock implementation for now
  return {
    success: true,
    access_token: 'mock_new_hubspot_access_token',
    refresh_token: 'mock_new_hubspot_refresh_token',
    expires_in: 1800
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

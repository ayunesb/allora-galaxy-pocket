
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

    const { tenant_id } = await req.json()

    // Fetch GA4 configuration
    const { data: ga4Config, error: configError } = await supabase
      .from('ga4_configs')
      .select('property_id')
      .eq('tenant_id', tenant_id)
      .single()

    if (configError || !ga4Config) {
      throw new Error('GA4 configuration not found')
    }

    // Fetch encrypted token
    const { data: tokenData, error: tokenError } = await supabase
      .from('encrypted_tokens')
      .select('encrypted_token')
      .eq('tenant_id', tenant_id)
      .eq('service', 'GA4')
      .single()

    if (tokenError || !tokenData) {
      throw new Error('GA4 token not found')
    }

    // Decrypt token (assuming base64 encoding)
    const decryptedToken = new TextDecoder().decode(
      decode(tokenData.encrypted_token)
    )

    // Fetch GA4 metrics
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
            { name: 'bounceRate' }
          ]
        }),
      }
    )

    if (!ga4Res.ok) {
      throw new Error('Failed to fetch GA4 metrics')
    }

    const metricsData = await ga4Res.json()

    // Extract and format metrics
    const sessions = metricsData.rows?.[0]?.metricValues?.[0]?.value || 0
    const bounceRate = metricsData.rows?.[0]?.metricValues?.[1]?.value || 0

    // Store metrics in KPI table
    const { error: kpiError } = await supabase.from('kpi_metrics').upsert([
      { 
        tenant_id, 
        metric: 'GA4 Sessions', 
        value: Number(sessions),
        recorded_at: new Date().toISOString()
      },
      { 
        tenant_id, 
        metric: 'Bounce Rate', 
        value: Number(bounceRate),
        recorded_at: new Date().toISOString()
      }
    ])

    if (kpiError) {
      console.error('Error storing KPI metrics:', kpiError)
    }

    return new Response(
      JSON.stringify({ sessions, bounceRate }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('GA4 Metrics Fetch Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    )
  }
})


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = 'https://lxsuqqlfuftnvuvtctsx.supabase.co'
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const { service, tenant_id } = await req.json()

    // Get the encrypted token
    const { data: tokenData, error: tokenError } = await supabase
      .from('encrypted_tokens')
      .select('*')
      .eq('tenant_id', tenant_id)
      .eq('service', service)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('Token not found')
    }

    // Test the connection based on the service
    switch (service) {
      case 'GA4':
        // Test GA4 connection
        const gaResponse = await fetch(
          'https://analyticsdata.googleapis.com/v1beta/properties/YOUR_PROPERTY_ID:runReport',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokenData.encrypted_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
              metrics: [{ name: 'sessions' }],
            }),
          }
        )

        if (!gaResponse.ok) {
          throw new Error('GA4 connection failed')
        }
        break

      case 'HUBSPOT':
        // Test HubSpot connection
        const hsResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          headers: {
            Authorization: `Bearer ${tokenData.encrypted_token}`,
          },
        })

        if (!hsResponse.ok) {
          throw new Error('HubSpot connection failed')
        }
        break

      default:
        throw new Error('Unsupported service')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

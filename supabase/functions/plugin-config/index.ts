
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const pluginKey = url.searchParams.get('plugin_key')
      const tenantId = url.searchParams.get('tenant_id')

      if (!pluginKey || !tenantId) {
        return new Response(
          JSON.stringify({ error: 'Missing plugin_key or tenant_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabaseClient
        .from('tenant_plugin_configs')
        .select('config')
        .eq('tenant_id', tenantId)
        .eq('plugin_key', pluginKey)
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ config: data?.config || {} }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (req.method === 'POST') {
      const { plugin_key, tenant_id, config } = await req.json()

      if (!plugin_key || !tenant_id || !config) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabaseClient
        .from('tenant_plugin_configs')
        .upsert({
          tenant_id,
          plugin_key,
          config,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      return new Response(
        JSON.stringify({ status: 'success' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

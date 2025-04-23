
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get demo tenant ID
    const { data: demoTenant } = await supabaseAdmin
      .from('tenant_profiles')
      .select('id')
      .eq('is_demo', true)
      .single()

    if (!demoTenant?.id) {
      throw new Error('Demo tenant not found')
    }

    // Reset demo tenant data
    await Promise.all([
      // Delete existing data
      supabaseAdmin.from('vault_strategies').delete().eq('tenant_id', demoTenant.id),
      supabaseAdmin.from('kpi_metrics').delete().eq('tenant_id', demoTenant.id),
      supabaseAdmin.from('campaigns').delete().eq('tenant_id', demoTenant.id),
      supabaseAdmin.from('system_logs').delete().eq('tenant_id', demoTenant.id)
    ])

    // Log the reset
    await supabaseAdmin.from('cron_job_logs').insert({
      function_name: 'reset-demo-tenant',
      status: 'success',
      message: 'Demo tenant data reset successfully'
    })

    return new Response(
      JSON.stringify({ message: 'Demo tenant reset successful' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in reset-demo-tenant:', error)
    
    // Log the error
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    await supabaseAdmin.from('cron_job_logs').insert({
      function_name: 'reset-demo-tenant',
      status: 'error',
      message: error.message
    })

    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})

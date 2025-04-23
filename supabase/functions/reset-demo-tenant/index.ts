
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function insertDemoSeedData(supabase: any, demoTenantId: string) {
  // Insert strategies
  await supabase.from('vault_strategies').insert([
    {
      tenant_id: demoTenantId,
      title: 'Launch Campaign Strategy',
      description: '## Goal: Rapid visibility\nUse WhatsApp, email, and cold outreach.\n1. Create engaging content\n2. Set up automation\n3. Monitor metrics',
      status: 'active',
      industry: 'SaaS',
      goal: 'Growth',
      confidence: 'High',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      tenant_id: demoTenantId,
      title: 'Content Funnel Strategy',
      description: '## Goal: MQL Generation\nCreate lead magnets, CTA sequences.\n1. Design lead magnets\n2. Set up email sequences\n3. Track conversions',
      status: 'draft',
      industry: 'Marketing',
      goal: 'Lead Generation',
      confidence: 'Medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])

  // Insert KPI metrics
  await supabase.from('kpi_metrics').insert([
    { tenant_id: demoTenantId, metric: 'Sessions', value: 4300 },
    { tenant_id: demoTenantId, metric: 'Bounce Rate', value: 28.6 },
    { tenant_id: demoTenantId, metric: 'Qualified Leads (7d)', value: 132 },
    { tenant_id: demoTenantId, metric: 'Conversion Rate', value: 3.8 },
    { tenant_id: demoTenantId, metric: 'MRR', value: 15200 }
  ])

  // Insert campaigns
  await supabase.from('campaigns').insert([
    { 
      tenant_id: demoTenantId, 
      name: 'Lead Reactivation Sequence',
      description: 'Re-engage dormant leads with personalized messaging',
      status: 'active',
      created_at: new Date().toISOString()
    },
    { 
      tenant_id: demoTenantId, 
      name: 'Welcome Funnel',
      description: 'Automated onboarding sequence for new subscribers',
      status: 'draft',
      created_at: new Date().toISOString()
    }
  ])

  // Insert system welcome message
  await supabase.from('system_logs').insert({
    tenant_id: demoTenantId,
    event_type: 'welcome_message',
    message: '👋 Welcome to the Allora OS Demo! This is a read-only preview of our platform. Explore our AI-driven marketing tools.',
    created_at: new Date().toISOString()
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
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
      supabaseAdmin.from('vault_strategies').delete().eq('tenant_id', demoTenant.id),
      supabaseAdmin.from('kpi_metrics').delete().eq('tenant_id', demoTenant.id),
      supabaseAdmin.from('campaigns').delete().eq('tenant_id', demoTenant.id),
      supabaseAdmin.from('system_logs').delete().eq('tenant_id', demoTenant.id)
    ])

    // Insert fresh demo data
    await insertDemoSeedData(supabaseAdmin, demoTenant.id)

    // Log the reset
    await supabaseAdmin.from('cron_job_logs').insert({
      function_name: 'reset-demo-tenant',
      status: 'success',
      message: 'Demo tenant data reset and seeded successfully'
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


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch enabled alert rules
    const { data: rules, error: rulesError } = await supabase
      .from('kpi_alert_rules')
      .select('*')
      .eq('enabled', true)

    if (rulesError) throw rulesError

    for (const rule of rules) {
      // Get current KPI value
      const { data: kpiData, error: kpiError } = await supabase
        .from('kpi_metrics')
        .select('value')
        .eq('tenant_id', rule.tenant_id)
        .eq('metric', rule.kpi_name)
        .eq('period', 'current')
        .single()

      if (kpiError) continue

      // Get historical value for comparison
      const { data: historicalData } = await supabase
        .from('kpi_metrics')
        .select('value')
        .eq('tenant_id', rule.tenant_id)
        .eq('metric', rule.kpi_name)
        .eq('period', rule.compare_period)
        .single()

      if (!kpiData || !historicalData) continue

      const currentValue = kpiData.value
      const previousValue = historicalData.value

      let shouldAlert = false
      let alertMessage = ''

      switch (rule.condition) {
        case '>':
          shouldAlert = currentValue > rule.threshold
          alertMessage = `${rule.kpi_name} exceeded threshold: ${currentValue} > ${rule.threshold}`
          break
        case '<':
          shouldAlert = currentValue < rule.threshold
          alertMessage = `${rule.kpi_name} fell below threshold: ${currentValue} < ${rule.threshold}`
          break
        case 'falls_by_%':
          const percentDrop = ((previousValue - currentValue) / previousValue) * 100
          shouldAlert = percentDrop >= rule.threshold
          alertMessage = `${rule.kpi_name} dropped by ${percentDrop.toFixed(2)}% (threshold: ${rule.threshold}%)`
          break
      }

      if (shouldAlert) {
        await supabase.from('agent_alerts').insert({
          tenant_id: rule.tenant_id,
          agent: 'KPI Monitor',
          alert_type: 'kpi_alert',
          message: alertMessage,
        })
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

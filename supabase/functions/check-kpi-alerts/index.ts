import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"
import { sendSlackAlert } from "../_shared/slack-alert.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FUNCTION_NAME = 'check-kpi-alerts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const { data: rules, error: rulesError } = await supabase
      .from('kpi_alert_rules')
      .select('*')
      .eq('enabled', true)

    if (rulesError) throw rulesError

    for (const rule of rules) {
      const { data: kpiData, error: kpiError } = await supabase
        .from('kpi_metrics')
        .select('value')
        .eq('tenant_id', rule.tenant_id)
        .eq('metric', rule.kpi_name)
        .eq('period', 'current')
        .single()

      if (kpiError) continue

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

    await supabase.from('cron_job_logs').insert({
      function_name: FUNCTION_NAME,
      status: 'success',
      message: 'KPI alerts checked successfully'
    })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    await supabase.from('cron_job_logs').insert({
      function_name: FUNCTION_NAME,
      status: 'failed',
      message: error.message
    })

    await sendSlackAlert(FUNCTION_NAME, error.message)

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

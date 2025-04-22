
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1"

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
    const { task_id } = await req.json()

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch the task
    const { data: task, error: taskError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('id', task_id)
      .single()

    if (taskError) throw taskError

    let result, status = 'success'

    try {
      // Execute task based on agent and type
      if (task.task_type === 'execution') {
        switch (task.agent) {
          case 'Notion':
            // Notion integration would go here
            result = { message: 'Notion task executed' }
            break
          case 'Stripe':
            // Stripe integration would go here
            result = { message: 'Stripe task executed' }
            break
          default:
            throw new Error(`Unknown agent: ${task.agent}`)
        }
      }
    } catch (e) {
      status = 'failed'
      result = { error: e.message }

      // Create alert for failed task
      await supabase.from('agent_alerts').insert({
        tenant_id: task.tenant_id,
        strategy_id: task.strategy_id,
        agent: task.agent,
        alert_type: 'failure',
        message: `Task failed: ${task.task_type} - ${e.message}`
      })
    }

    // Update task status
    await supabase
      .from('agent_tasks')
      .update({
        status,
        result,
        executed_at: new Date().toISOString()
      })
      .eq('id', task_id)

    return new Response(
      JSON.stringify({ status, result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { task_id, status } = await req.json()

    // Fetch the task to get associated strategy details
    const { data: task, error: taskError } = await supabase
      .from('agent_tasks')
      .select('strategy_id, tenant_id')
      .eq('id', task_id)
      .single()

    if (taskError) throw taskError

    // Update strategy status when task is completed
    if (status === 'completed') {
      const { error: strategyUpdateError } = await supabase
        .from('strategies')
        .update({ 
          status: 'executed', 
          executed_at: new Date().toISOString() 
        })
        .eq('id', task.strategy_id)

      if (strategyUpdateError) throw strategyUpdateError

      // Optional: Send notification about strategy execution
      await supabase.functions.invoke('send-webhook-notification', {
        body: {
          message: `Strategy ${task.strategy_id} has been executed successfully.`,
          type: 'strategy_update',
          tenant_id: task.tenant_id
        }
      })
    }

    return new Response(
      JSON.stringify({ message: 'Strategy status updated successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error updating strategy status:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

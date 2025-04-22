
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Fetch failed tasks that need retry
    const { data: tasks, error: tasksError } = await supabase
      .from('agent_tasks')
      .select('*')
      .eq('status', 'pending')
      .lt('retry_count', 3)
      .lte('retry_after', new Date().toISOString())
      .limit(10)

    if (tasksError) throw tasksError

    const results = []
    for (const task of tasks || []) {
      try {
        // Call execute-agent-task function for each task
        const response = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/execute-agent-task`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
            },
            body: JSON.stringify({ task_id: task.id })
          }
        )

        if (!response.ok) throw new Error('Failed to execute task')
        
        const result = await response.json()
        results.push({ task_id: task.id, status: 'retried', result })
      } catch (err) {
        results.push({ task_id: task.id, status: 'error', error: err.message })
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
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

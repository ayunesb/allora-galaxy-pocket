
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { strategy_id } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: tasks, error: tasksError } = await supabase
      .from("agent_tasks")
      .select("status")
      .eq("strategy_id", strategy_id);

    if (tasksError) throw tasksError;

    const total = tasks.length;
    const success = tasks.filter(t => t.status === "success").length;
    const fail = tasks.filter(t => t.status === "failed").length;

    const score = total > 0 ? Math.round((success / total) * 100) : 0;

    const { error: updateError } = await supabase
      .from("strategies")
      .update({ health_score: score })
      .eq("id", strategy_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ health_score: score }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in strategy scorecard:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

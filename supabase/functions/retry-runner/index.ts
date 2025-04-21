
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[RetryRunner] Starting retry cycle");

    const { data: jobs, error } = await supabase
      .from("retry_queue")
      .select("*")
      .lt("retry_count", "max_attempts")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) throw error;

    const results = [];
    for (const job of jobs || []) {
      try {
        console.log(`[RetryRunner] Processing job ${job.id} (${job.task})`);

        // Mark job as in-progress
        await supabase
          .from("retry_queue")
          .update({ 
            status: "processing",
            last_attempt_at: new Date().toISOString()
          })
          .eq("id", job.id);

        // Execute the task based on task type
        switch (job.task) {
          // Add task handlers here as needed
          default:
            console.warn(`[RetryRunner] Unknown task type: ${job.task}`);
        }

        // On success, mark as completed
        await supabase
          .from("retry_queue")
          .update({ status: "completed" })
          .eq("id", job.id);

        results.push({ id: job.id, status: "success" });

      } catch (err) {
        console.error(`[RetryRunner] Failed to process job ${job.id}:`, err);
        
        // Update retry count and error message
        await supabase
          .from("retry_queue")
          .update({ 
            retry_count: job.retry_count + 1,
            status: "pending",
            error_message: err.message,
            next_attempt_at: new Date(Date.now() + 1800000).toISOString() // 30 min delay
          })
          .eq("id", job.id);

        results.push({ id: job.id, status: "error", message: err.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        status: "success", 
        message: "Retry cycle completed", 
        results 
      }), 
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (err) {
    console.error("[RetryRunner] Cycle failed:", err);
    return new Response(
      JSON.stringify({ 
        status: "error", 
        message: err.message 
      }), 
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

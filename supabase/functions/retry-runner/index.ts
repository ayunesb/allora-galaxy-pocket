
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
    
    // Check if a specific job ID was requested for retry
    let jobId;
    try {
      const body = await req.json();
      jobId = body.job_id;
    } catch (err) {
      // No body or invalid JSON - will process all pending jobs
    }

    const jobQuery = supabase
      .from("retry_queue")
      .select("*")
      .lt("retry_count", "max_attempts")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    // If specific job ID provided, only retry that job
    if (jobId) {
      jobQuery.eq("id", jobId);
    } else {
      jobQuery.limit(10); // Otherwise process a batch of jobs
    }

    const { data: jobs, error } = await jobQuery;

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
          case "update_metrics":
            await processMqlMetricsUpdate(job);
            break;
          case "ga4_metrics_fetch":
            await processGa4MetricsFetch(job);
            break;
          case "send_weekly_summary":
            await processWeeklySummary(job);
            break;
          // Add more task handlers here as needed
          default:
            console.warn(`[RetryRunner] Unknown task type: ${job.task}`);
            throw new Error(`Unsupported task type: ${job.task}`);
        }

        // On success, mark as completed
        await supabase
          .from("retry_queue")
          .update({ status: "completed" })
          .eq("id", job.id);

        // Log successful execution
        await supabase
          .from("cron_job_logs")
          .insert({
            function_name: `retry-runner:${job.task}`,
            status: "success",
            message: `Successfully retried ${job.task}`
          });

        results.push({ id: job.id, status: "success" });

      } catch (err) {
        console.error(`[RetryRunner] Failed to process job ${job.id}:`, err);
        
        // Update retry count and error message
        await supabase
          .from("retry_queue")
          .update({ 
            retry_count: job.retry_count + 1,
            status: job.retry_count + 1 >= job.max_attempts ? "failed" : "pending",
            error_message: err.message,
            next_attempt_at: new Date(Date.now() + 1800000).toISOString() // 30 min delay
          })
          .eq("id", job.id);

        // Log failed execution
        await supabase
          .from("cron_job_logs")
          .insert({
            function_name: `retry-runner:${job.task}`,
            status: "error",
            message: `Error retrying ${job.task}: ${err.message}`
          });

        results.push({ id: job.id, status: "error", message: err.message });
      }
    }

    return new Response(
      JSON.stringify({ 
        status: "success", 
        message: "Retry cycle completed", 
        jobs_processed: results.length,
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

// Task processing functions
async function processMqlMetricsUpdate(job) {
  const { tenant_id } = job.payload;
  
  if (!tenant_id) {
    throw new Error("Missing tenant_id in job payload");
  }
  
  const { error } = await supabase.functions.invoke("update-mql-metrics", {
    body: { tenant_id }
  });
  
  if (error) throw error;
}

async function processGa4MetricsFetch(job) {
  const { tenant_id } = job.payload;
  
  if (!tenant_id) {
    throw new Error("Missing tenant_id in job payload");
  }
  
  const { error } = await supabase.functions.invoke("fetch-ga4-metrics", {
    body: { tenant_id }
  });
  
  if (error) throw error;
}

async function processWeeklySummary(job) {
  const { tenant_id } = job.payload;
  
  if (!tenant_id) {
    throw new Error("Missing tenant_id in job payload");
  }
  
  const { error } = await supabase.functions.invoke("process-weekly-summaries", {
    body: { tenant_id }
  });
  
  if (error) throw error;
}

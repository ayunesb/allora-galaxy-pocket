
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { alert_id } = await req.json();
    if (!alert_id) {
      return new Response(JSON.stringify({ error: "Missing alert_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch the failed job data
    const { data: jobData, error: jobError } = await supabase
      .from("retry_queue")
      .select("*")
      .eq("id", alert_id)
      .single();

    if (jobError) {
      console.error("Error fetching job data:", jobError);
      // If job not found in retry queue, check agent alerts
      const { data: alertData, error: alertError } = await supabase
        .from("agent_alerts")
        .select("*")
        .eq("id", alert_id)
        .maybeSingle();

      if (alertError || !alertData) {
        return new Response(JSON.stringify({ error: "Failed to find alert or job data" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Use alert data instead
      const prompt = generatePromptFromAlert(alertData);
      const suggestion = await generateRecoveryStrategy(prompt);
      
      // Insert new recovery strategy
      const { error: insertError } = await supabase.from("recovery_strategies").insert({
        tenant_id: alertData.tenant_id,
        alert_id,
        strategy_title: `AI Recovery Plan: ${alertData.alert_type}`,
        summary: suggestion,
        assigned_agent: alertData.agent || "CEO",
        actions: [{ step: suggestion, tool: "AI Recovery" }],
        status: "pending"
      });

      if (insertError) {
        console.error("Error inserting recovery strategy:", insertError);
        throw new Error("Failed to save recovery strategy");
      }

      return new Response(JSON.stringify({ suggestion }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate recovery strategy from job data
    const prompt = generatePromptFromJob(jobData);
    const suggestion = await generateRecoveryStrategy(prompt);

    // Insert new recovery strategy
    const { error: insertError } = await supabase.from("recovery_strategies").insert({
      tenant_id: jobData.tenant_id,
      alert_id,
      strategy_title: `AI Recovery Plan: ${jobData.task}`,
      summary: suggestion,
      assigned_agent: "CEO",
      actions: [{ step: suggestion, tool: "AI Recovery" }],
      status: "pending"
    });

    if (insertError) {
      console.error("Error inserting recovery strategy:", insertError);
      throw new Error("Failed to save recovery strategy");
    }

    return new Response(JSON.stringify({ suggestion }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[auto-recover] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Helper function to generate prompt from job data
function generatePromptFromJob(jobData: any): string {
  return `You are the AI Recovery Expert for Allora OS business operating system.

Task '${jobData.task}' has failed ${jobData.retry_count} times (max attempts: ${jobData.max_attempts}).
Error message: "${jobData.error_message || 'Unknown error'}"

Task payload: ${JSON.stringify(jobData.payload, null, 2)}

Your task:
1. Analyze the potential cause of this failure
2. Generate a 3-step recovery plan that operations can implement
3. Suggest preventive measures for avoiding similar failures in future

Provide a concise, actionable recovery strategy. Focus on practical steps.`;
}

// Helper function to generate prompt from alert data
function generatePromptFromAlert(alertData: any): string {
  return `You are the AI Recovery Expert for Allora OS business operating system.

Alert details:
- Type: ${alertData.alert_type}
- Agent: ${alertData.agent || "System"}
- Message: "${alertData.message}"
- Severity: ${alertData.status || "Unknown"}

Your task:
1. Analyze the potential cause of this issue
2. Generate a 3-step recovery plan that operations can implement
3. Suggest preventive measures for avoiding similar issues in future

Provide a concise, actionable recovery strategy. Focus on practical steps.`;
}

// Function to generate recovery strategy using OpenAI
async function generateRecoveryStrategy(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return completion.choices[0]?.message?.content || "No suggestion generated.";
}

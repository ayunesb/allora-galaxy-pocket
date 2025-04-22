
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

    // Fetch alert data
    const { data: alert, error: alertError } = await supabase
      .from("agent_alerts")
      .select("*")
      .eq("id", alert_id)
      .maybeSingle();

    if (alertError || !alert) {
      return new Response(JSON.stringify({ error: alertError?.message || "Alert not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compose OpenAI prompt
    const prompt = `Strategy needed for alert: ${alert.message}`;
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const suggestion = completion.choices[0]?.message?.content || "No suggestion generated.";

    // Insert new recovery strategy
    const { error: insertError } = await supabase.from("recovery_strategies").insert({
      tenant_id: alert.tenant_id,
      alert_id,
      strategy_title: "AI Recovery Plan",
      summary: suggestion,
      assigned_agent: "CEO",
      actions: [{ step: suggestion, tool: "Notion" }],
      status: "pending"
    });

    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

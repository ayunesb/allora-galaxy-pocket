
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
    const { strategy_id, feedback } = await req.json();
    if (!strategy_id || typeof feedback !== "string") {
      return new Response(JSON.stringify({ error: "Missing strategy_id or feedback" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get recovery strategy data
    const { data: strategy, error: strategyError } = await supabase
      .from("recovery_strategies")
      .select("*")
      .eq("id", strategy_id)
      .maybeSingle();

    if (strategyError || !strategy) {
      return new Response(JSON.stringify({ error: strategyError?.message || "Strategy not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Compose OpenAI prompt to evaluate learning
    const prompt = `Learn from this outcome:\nStrategy: ${strategy.summary}\nFeedback: ${feedback}\nShould the AI mark this as "learned"? Reply with "Yes" or "No".`;
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });

    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1
    });

    const decision = result.choices[0]?.message?.content ?? "";
    const learned = /yes/i.test(decision);

    // Update feedback notes and learned flag in recovery_strategies
    const { error: updateError } = await supabase
      .from("recovery_strategies")
      .update({ feedback_notes: feedback, learned })
      .eq("id", strategy_id);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ learned }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[recovery-learn] Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

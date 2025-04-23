
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { kpi_name } = await req.json();
    const messages = [
      {
        role: "system",
        content: "You are an AI business plugin matcher. Based on the given KPI, suggest 3 plugins from the Supabase Marketplace that would help improve or optimize it. Always format your list as numbered and include 1-sentence justification per plugin.",
      },
      {
        role: "user",
        content: `Suggest 3 plugins to improve the KPI: ${kpi_name}`,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        temperature: 0.3,
      }),
    });

    const aiContent = await response.json();
    const recs = aiContent.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ recommendations: recs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[plugin-recommend] error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

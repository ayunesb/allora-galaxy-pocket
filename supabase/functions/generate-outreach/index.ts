
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
    const { offer, lead } = await req.json();

    const messages = [
      {
        role: "system",
        content:
          "You are a top-tier B2B outbound copywriter. Write brief, persuasive outbound email or DM for lead gen.",
      },
      {
        role: "user",
        content: `Write a high-converting outbound message to ${lead} promoting: ${offer}. Include a strong CTA.`,
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
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content || "";
    const subject = `Quick idea for ${lead}`;

    return new Response(
      JSON.stringify({
        subject,
        body: aiContent,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[generate-outreach] error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

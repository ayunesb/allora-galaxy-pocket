
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://esm.sh/openai@4.17.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    // Initialize OpenAI client
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { pluginId } = await req.json();
    
    if (!pluginId) {
      throw new Error("pluginId is required");
    }

    console.log(`Generating AI review for plugin ID: ${pluginId}`);

    // Fetch plugin data
    const { data: plugin, error: fetchError } = await supabase
      .from("plugin_submissions")
      .select("plugin_name, description, schema_sql, install_script")
      .eq("id", pluginId)
      .single();

    if (fetchError || !plugin) {
      throw new Error(`Failed to fetch plugin data: ${fetchError?.message || "Plugin not found"}`);
    }

    console.log(`Retrieved plugin: ${plugin.plugin_name}`);

    // Create prompt for AI
    const prompt = `
You're an expert plugin reviewer for Allora OS. Review the following plugin for quality, clarity, and usefulness.

Name: ${plugin.plugin_name}
Description: ${plugin.description}
Schema SQL: ${plugin.schema_sql ? plugin.schema_sql.slice(0, 800) : "None provided"}
Install Script: ${plugin.install_script ? plugin.install_script.slice(0, 300) : "None provided"}

Give pros, cons, and a suggested badge (Trusted, Beta, Needs Work). Format your response as:

## Pros
- Point 1
- Point 2

## Cons
- Point 1
- Point 2

## Suggested Badge
[Your badge recommendation]

## General Feedback
[General feedback and improvement suggestions]
`;

    console.log("Sending request to OpenAI...");

    // Generate AI feedback
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using the recommended model from the context
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const aiReview = completion.choices[0].message.content;
    console.log("AI review generated successfully");

    // Update the submission with the AI review
    const { error: updateError } = await supabase
      .from("plugin_submissions")
      .update({ ai_review: aiReview })
      .eq("id", pluginId);

    if (updateError) {
      throw new Error(`Failed to update plugin with AI review: ${updateError.message}`);
    }

    console.log("Plugin submission updated with AI review");

    return new Response(JSON.stringify({ 
      success: true, 
      feedback: aiReview 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });
  } catch (error) {
    console.error(`Error in plugin-review-feedback: ${error.message}`);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500
    });
  }
});

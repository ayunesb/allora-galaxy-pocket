
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
    const { campaign_id, tenant_id } = await req.json();
    
    if (!campaign_id) {
      return new Response(
        JSON.stringify({ error: "Missing campaign_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaign_id)
      .single();
      
    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get related KPI metrics
    const { data: metrics, error: metricsError } = await supabase
      .from("kpi_metrics")
      .select("*")
      .eq("tenant_id", campaign.tenant_id || tenant_id)
      .order("recorded_at", { ascending: false })
      .limit(20);
      
    if (metricsError) {
      console.error("Error fetching metrics:", metricsError);
      // Continue with limited data
    }
    
    // Get similar past campaigns
    const { data: similarCampaigns, error: similarError } = await supabase
      .from("campaigns")
      .select("*")
      .neq("id", campaign_id)
      .eq("tenant_id", campaign.tenant_id || tenant_id)
      .order("created_at", { ascending: false })
      .limit(5);
      
    if (similarError) {
      console.error("Error fetching similar campaigns:", similarError);
      // Continue with limited data
    }
    
    // Use OpenAI to predict performance and generate recommendations
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a campaign performance prediction expert for Allora OS. 
          Analyze campaign data and predict outcomes based on similar campaigns and metrics.
          Provide actionable recommendations to optimize performance.`
        },
        {
          role: "user",
          content: `Analyze this campaign and predict its performance:
          
CURRENT CAMPAIGN:
${JSON.stringify(campaign, null, 2)}

RECENT METRICS:
${JSON.stringify(metrics || [], null, 2)}

SIMILAR CAMPAIGNS:
${JSON.stringify(similarCampaigns || [], null, 2)}

Provide:
1. Performance prediction with estimated success metrics
2. 3 specific optimization recommendations
3. Risk factors that might impact performance
4. Expected ROI range`
        }
      ],
      temperature: 0.3,
    });

    const analysis = completion.choices[0]?.message?.content || "Unable to generate analysis";
    
    // Store the prediction in the database
    const { data: prediction, error: insertError } = await supabase
      .from("campaign_predictions")
      .insert({
        campaign_id,
        tenant_id: campaign.tenant_id || tenant_id,
        prediction: analysis,
        created_at: new Date().toISOString(),
        confidence_score: 0.8, // Default confidence
      })
      .select()
      .single();
      
    if (insertError) {
      console.error("Error storing prediction:", insertError);
      // Continue anyway to return analysis to user
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        prediction_id: prediction?.id,
        campaign_name: campaign.name,
        created_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in predict-campaign-performance:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import OpenAI from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Logger function
function logEvent(level: 'info' | 'error' | 'warn', message: string, data?: any) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(data ? { data } : {})
  }));
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let tenantId: string | null = null;
  let campaignId: string | null = null;
  
  try {
    const requestBody = await req.json();
    campaignId = requestBody.campaign_id;
    tenantId = requestBody.tenant_id;
    
    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: "Missing campaign_id parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Log the operation start
    logEvent('info', 'Starting campaign prediction', { campaignId, tenantId });
    
    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle();
      
    if (campaignError || !campaign) {
      logEvent('error', 'Campaign not found', { campaignId, error: campaignError });
      return new Response(
        JSON.stringify({ error: "Campaign not found", details: campaignError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use the campaign's tenant ID if not provided in the request
    tenantId = tenantId || campaign.tenant_id;
    
    if (!tenantId) {
      logEvent('error', 'No tenant ID available');
      return new Response(
        JSON.stringify({ error: "No tenant ID available" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get related KPI metrics
    const { data: metrics, error: metricsError } = await supabase
      .from("kpi_metrics")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("recorded_at", { ascending: false })
      .limit(20);
      
    if (metricsError) {
      logEvent('warn', 'Error fetching KPI metrics', { error: metricsError });
      // Continue with limited data
    }
    
    // Get similar past campaigns
    const { data: similarCampaigns, error: similarError } = await supabase
      .from("campaigns")
      .select("*")
      .neq("id", campaignId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(5);
      
    if (similarError) {
      logEvent('warn', 'Error fetching similar campaigns', { error: similarError });
      // Continue with limited data
    }
    
    // Use OpenAI to predict performance and generate recommendations
    let analysis = "";
    let openaiError = null;
    
    try {
      const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
      if (!openaiApiKey) {
        throw new Error("OpenAI API key is not configured");
      }
      
      const openai = new OpenAI({ apiKey: openaiApiKey });
      
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

      analysis = completion.choices[0]?.message?.content || "Unable to generate analysis";
    } catch (error) {
      logEvent('error', 'OpenAI API error', { error });
      openaiError = error;
      analysis = "Error generating campaign prediction. Please try again later.";
    }
    
    // Store the prediction in the database
    let prediction = null;
    
    try {
      const { data: predictionData, error: insertError } = await supabase
        .from("campaign_predictions")
        .insert({
          campaign_id: campaignId,
          tenant_id: tenantId,
          prediction: analysis,
          created_at: new Date().toISOString(),
          confidence_score: openaiError ? 0.4 : 0.8, // Lower confidence if there was an API error
          prediction_error: openaiError ? openaiError.message : null,
        })
        .select()
        .single();
        
      if (insertError) {
        logEvent('error', 'Error storing prediction', { error: insertError });
      } else {
        prediction = predictionData;
      }
    } catch (dbError) {
      logEvent('error', 'Database error when storing prediction', { error: dbError });
    }

    // Log the operation completion
    const duration = Date.now() - startTime;
    
    try {
      await supabase.from('cron_job_logs').insert({
        function_name: 'predict-campaign-performance',
        status: openaiError ? 'partial_success' : 'success',
        message: openaiError 
          ? `Prediction completed with API error: ${openaiError.message}`
          : `Prediction completed successfully in ${duration}ms`,
        tenant_id: tenantId,
        duration_ms: duration
      });
    } catch (logError) {
      console.error('Failed to log completion:', logError);
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        prediction_id: prediction?.id,
        campaign_name: campaign.name,
        created_at: new Date().toISOString(),
        duration_ms: duration,
        error: openaiError?.message
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    logEvent('error', 'Error in predict-campaign-performance', { error, campaignId, tenantId });
    
    // Log the error
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      await supabase.from('cron_job_logs').insert({
        function_name: 'predict-campaign-performance',
        status: 'error',
        message: `Error: ${error.message}`,
        tenant_id: tenantId,
        duration_ms: duration
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to predict campaign performance',
        details: error.message || 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


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
    const { tenant_id, metrics } = await req.json();
    
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch KPI metrics if not provided in the request
    let kpiMetrics = metrics;
    if (!kpiMetrics) {
      const { data, error } = await supabase
        .from("kpi_metrics")
        .select("*")
        .eq("tenant_id", tenant_id)
        .order("recorded_at", { ascending: false });
        
      if (error) throw new Error(`Error fetching KPI metrics: ${error.message}`);
      
      // Get unique metrics for the most recent date
      kpiMetrics = data || [];
    }
    
    // If there are no metrics, return an empty response
    if (!kpiMetrics || kpiMetrics.length === 0) {
      return new Response(
        JSON.stringify({ message: "No metrics data available for analysis", recommendations: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get historical metrics for comparison
    const { data: historicalMetrics, error: histError } = await supabase
      .from("kpi_metrics_history")
      .select("*")
      .eq("tenant_id", tenant_id)
      .order("recorded_at", { ascending: false });
      
    if (histError) {
      console.warn("Error fetching historical metrics:", histError);
      // Continue without historical data if not available
    }

    // Generate analysis using AI
    const openai = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY")! });
    
    const metricsSummary = kpiMetrics.map(m => ({
      metric: m.metric,
      current_value: m.value,
      previous_value: findPreviousValue(m.metric, historicalMetrics || []),
      recorded_at: m.recorded_at
    }));

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an AI business strategy advisor. Analyze the KPI metrics provided and generate actionable recommendations to improve performance.`
        },
        {
          role: "user",
          content: `Based on these KPI metrics, provide 3-5 strategic recommendations to improve business performance:
          
${JSON.stringify(metricsSummary, null, 2)}

For each recommendation, include:
1. A clear, actionable title
2. Brief explanation of why this recommendation matters
3. Specific steps to implement it
4. Expected outcome or improvement`
        }
      ],
      temperature: 0.3,
    });

    const recommendations = completion.choices[0]?.message?.content || "No recommendations generated.";
    
    // Store the recommendations in the database
    const { error: insertError } = await supabase
      .from("strategy_recommendations")
      .insert({
        strategy_id: null, // This is a system-generated recommendation
        tenant_id,
        recommendation: recommendations,
        created_at: new Date().toISOString(),
        priority: "medium", // Default priority
        status: "pending"
      });
      
    if (insertError) {
      console.error("Error storing recommendations:", insertError);
      // Continue anyway to return recommendations to user
    }

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-kpi-recommendations:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Helper function to find previous value for a metric
function findPreviousValue(metricName: string, historicalMetrics: any[]): number | null {
  const previousMetric = historicalMetrics.find(m => m.metric === metricName);
  return previousMetric ? previousMetric.value : null;
}

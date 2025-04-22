
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { metrics } = await req.json()
    
    if (!metrics || !Array.isArray(metrics)) {
      throw new Error("Invalid metrics data provided")
    }
    
    // In a production system, this would call OpenAI API
    // For this example, we'll generate synthetic suggestions based on the data
    
    const suggestions = metrics.map((metric) => {
      const { kpi_name, current_value, previous_value, percent_change } = metric
      
      // Generate rules based on historical data patterns
      if (percent_change < 0) {
        // If value is decreasing, create a rule to alert on further decreases
        const absChange = Math.abs(percent_change)
        return {
          kpi_name,
          condition: "falls_by_%",
          threshold: Math.round(Math.min(Math.max(absChange * 1.2, 5), 20)), // 5-20% range
          compare_period: "7d"
        }
      } else if (current_value > 0) {
        // If value is increasing or stable, create a rule to alert on significant drops
        return {
          kpi_name,
          condition: "<",
          threshold: Math.round(current_value * 0.85), // Alert if below 85% of current
          compare_period: "7d"
        }
      } else {
        // General rule for metrics at zero or undefined behavior
        return {
          kpi_name,
          condition: "falls_by_%",
          threshold: 10, // Default 10% drop alert
          compare_period: "7d"
        }
      }
    })

    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in generate-alert-suggestions:", error.message)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

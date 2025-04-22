
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export type AlertRuleSuggestion = {
  kpi_name: string;
  condition: string;
  threshold: number;
  compare_period: string;
};

export function useKpiAlertSuggestions() {
  const { tenant } = useTenant();

  const generateSuggestions = useMutation({
    mutationFn: async () => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      // Get historical KPI metrics data
      const { data: metricsData } = await supabase
        .from("kpi_metrics_history")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("recorded_at", { ascending: false });
      
      // Get current KPI metrics
      const { data: currentMetrics } = await supabase
        .from("kpi_metrics")
        .select("*")
        .eq("tenant_id", tenant.id);
      
      if (!metricsData?.length || !currentMetrics?.length) {
        throw new Error("Insufficient data for suggestions");
      }
      
      // Format the data for analysis
      const formattedData = formatDataForSuggestions(currentMetrics, metricsData);
      
      // Call the Edge Function for AI-powered suggestions
      const { data, error } = await supabase.functions.invoke("generate-alert-suggestions", {
        body: { metrics: formattedData }
      });
      
      if (error) throw new Error(error.message);
      return data as AlertRuleSuggestion[];
    }
  });

  return {
    generateSuggestions: generateSuggestions.mutate,
    isGenerating: generateSuggestions.isPending,
    suggestions: generateSuggestions.data || [],
    error: generateSuggestions.error
  };
}

function formatDataForSuggestions(
  currentMetrics: any[],
  historicalMetrics: any[]
) {
  // Group metrics by name
  const metricsByName = currentMetrics.reduce((acc, metric) => {
    acc[metric.metric] = { current: metric.value };
    return acc;
  }, {} as Record<string, { current: number, previous?: number }>);
  
  // Add historical data
  historicalMetrics.forEach(metric => {
    if (metricsByName[metric.metric]) {
      if (!metricsByName[metric.metric].previous) {
        metricsByName[metric.metric].previous = metric.value;
      }
    }
  });
  
  // Convert to array format for AI processing
  return Object.entries(metricsByName).map(([name, values]) => ({
    kpi_name: name,
    current_value: values.current,
    previous_value: values.previous || values.current,
    percent_change: values.previous 
      ? ((values.current - values.previous) / values.previous) * 100
      : 0
  }));
}

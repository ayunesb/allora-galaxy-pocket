import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export type AlertRuleSuggestion = {
  kpi_name: string;
  condition: string;
  threshold: number;
  compare_period: string;
};

// Define proper interfaces for our data structures
interface MetricData {
  current: number;
  previous?: number;
}

interface MetricComparison {
  kpi_name: string;
  current_value: number;
  previous_value: number;
  percent_change: number;
}

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
  // Group metrics by name with properly typed Record
  const metricsByName: Record<string, MetricData> = currentMetrics.reduce((acc, metric) => {
    acc[metric.metric] = { current: Number(metric.value) };
    return acc;
  }, {} as Record<string, MetricData>);
  
  // Add historical data
  historicalMetrics.forEach(metric => {
    if (metricsByName[metric.metric]) {
      if (!metricsByName[metric.metric].previous) {
        metricsByName[metric.metric].previous = Number(metric.value);
      }
    }
  });
  
  // Convert to array format for AI processing with proper typing
  return Object.entries(metricsByName).map(([name, values]: [string, MetricData]): MetricComparison => {
    const current = values.current;
    const previous = values.previous || values.current;
    return {
      kpi_name: name,
      current_value: current,
      previous_value: previous,
      percent_change: previous 
        ? ((current - previous) / previous) * 100
        : 0
    };
  });
}

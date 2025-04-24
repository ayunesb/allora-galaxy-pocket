
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDataFetching } from "@/hooks/useDataFetching";

export interface SystemHealthMetric {
  metricName: string;
  value: number;
  status: "healthy" | "warning" | "critical";
  change?: number;
}

export function useSystemHealthMetrics() {
  const getSystemMetrics = async () => {
    const { data, error } = await supabase
      .from("system_metrics")
      .select("*")
      .order("recorded_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const metrics: SystemHealthMetric[] = [
      {
        metricName: "API Response Time",
        value: 150,
        status: "healthy",
        change: -5
      },
      {
        metricName: "Database Queries",
        value: 200,
        status: "warning",
        change: 12
      },
      {
        metricName: "Error Rate",
        value: 0.2,
        status: "healthy",
        change: -0.5
      },
      {
        metricName: "Edge Function Latency",
        value: 320,
        status: "warning",
        change: 30
      },
      {
        metricName: "Storage Usage",
        value: 45,
        status: "healthy",
        change: 5
      }
    ];

    // When we have real data, transform it here
    if (data && data.length > 0) {
      // Transform actual metrics from the database
    }

    return metrics;
  };

  const cronJobQuery = useQuery({
    queryKey: ["system-health-metrics"],
    queryFn: getSystemMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return useDataFetching(cronJobQuery);
}

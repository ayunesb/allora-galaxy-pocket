
import { Loader2 } from "lucide-react";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
import KpiCard from "@/app/insights/kpis/KpiCard";

export function KPITracker() {
  const { data: metrics, isLoading, error } = useKpiMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load KPI metrics: {error.message}
      </div>
    );
  }

  if (!metrics?.length) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No KPI metrics available. Set up your KPIs in the settings page.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {metrics.map((metric) => (
        <KpiCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}

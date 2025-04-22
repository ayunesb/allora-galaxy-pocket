
import { Loader2 } from "lucide-react";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
import KpiCard from "@/app/insights/kpis/KpiCard";
import type { KpiMetric } from "@/types/kpi";

interface KPITrackerProps {
  kpis: KpiMetric[];
}

export function KPITracker({ kpis }: KPITrackerProps) {
  if (!kpis || kpis.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No KPI metrics available. Set up your KPIs in the settings page.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {kpis.map((metric) => (
        <KpiCard key={metric.label} {...metric} />
      ))}
    </div>
  );
}

export function KPITrackerWithData() {
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

  return <KPITracker kpis={metrics || []} />;
}


import { Loader2 } from "lucide-react";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
import { QueryErrorBoundary } from "./QueryErrorBoundary";
import KpiCard from "@/app/insights/kpis/components/KpiCard";
import type { KpiMetric } from "@/types/kpi";

interface KPITrackerProps {
  kpis: KpiMetric[];
}

export function KPITracker({ kpis }: KPITrackerProps) {
  if (!kpis || kpis.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-lg font-semibold">📉 No KPI Data Yet</h2>
        <p className="text-sm">Set up your KPIs in the settings page to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {kpis.map((metric) => (
        <KpiCard key={metric.id || `metric-${metric.kpi_name}`} {...metric} />
      ))}
    </div>
  );
}

export function KPITrackerWithData() {
  const { data: metrics, isLoading, error, refetch } = useKpiMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <QueryErrorBoundary error={error} resetQuery={refetch}>
      <KPITracker kpis={metrics || []} />
    </QueryErrorBoundary>
  );
}

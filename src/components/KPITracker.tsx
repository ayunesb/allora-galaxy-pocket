
import { Loader2 } from "lucide-react";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
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
        <p className="text-sm">Metrics will appear here once your AI agents begin executing.</p>
        <p className="text-xs mt-4">You can set up your KPIs in the settings page.</p>
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

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Failed to load KPI metrics: {error instanceof Error ? error.message : 'Unknown error'}</p>
        <button 
          className="mt-4 px-4 py-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  return <KPITracker kpis={metrics || []} />;
}

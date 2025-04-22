
import KpiMetricCard from "@/app/dashboard/insights/components/KpiMetricCard";
import { AlertTriangle } from "lucide-react";
import type { KpiAlert } from "@/types/kpi";

interface MetricSummary {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  change: number;
  alerts: KpiAlert[];
}
interface KpiMetricSummaryGridProps {
  metricSummaries: MetricSummary[];
}

export default function KpiMetricSummaryGrid({ metricSummaries }: KpiMetricSummaryGridProps) {
  if (!metricSummaries || metricSummaries.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No KPI metrics found. Start by creating some metrics in the settings page.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metricSummaries.map((metric) => (
        <div key={metric.title} className="relative">
          <KpiMetricCard
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            change={Number(metric.change)}
          />
          {metric.alerts.length > 0 && (
            <div className="absolute top-0 right-0 -mt-2 -mr-2">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

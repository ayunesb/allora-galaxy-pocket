
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { KpiMetric } from "@/types/kpi";

interface KpiMetricSummaryGridProps {
  metricSummaries: KpiMetric[];
}

export default function KpiMetricSummaryGrid({ metricSummaries }: KpiMetricSummaryGridProps) {
  if (!metricSummaries || metricSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">No KPI Data Yet</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-2">Metrics will appear here once your AI agents begin executing.</p>
          <p className="text-sm">You can set up KPI metrics in the settings page or wait for automatic data collection.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {metricSummaries.map((metric) => (
        <Card key={metric.id || metric.kpi_name}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{metric.kpi_name}</CardTitle>
              {metric.trend && (
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {metric.trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            {metric.changePercent !== undefined && (
              <p className={`text-xs ${metric.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                {metric.trend === "up" ? "+" : ""}{metric.changePercent}% from previous period
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

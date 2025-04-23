
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricSummary {
  label: string;
  value: string | number;
  trend: "up" | "down" | "neutral";
  changePercent?: number;
  hasAlert?: boolean;
}

interface KpiMetricSummaryGridProps {
  metricSummaries: MetricSummary[];
}

export default function KpiMetricSummaryGrid({ metricSummaries }: KpiMetricSummaryGridProps) {
  if (!metricSummaries?.length) {
    return (
      <div className="p-8 bg-slate-50 rounded-lg text-center">
        <h3 className="text-lg font-medium mb-2">No metrics available</h3>
        <p className="text-muted-foreground">
          Set up your KPIs in the settings to start tracking your performance.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {metricSummaries.map((metric) => (
        <Card 
          key={metric.label} 
          className={`overflow-hidden transition-shadow hover:shadow-md 
            ${metric.hasAlert ? 'border-amber-300' : ''}`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <CardTitle className="text-lg font-medium">{metric.label}</CardTitle>
              {metric.trend !== "neutral" && (
                <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-5 w-5" />
                  ) : (
                    <TrendingDown className="h-5 w-5" />
                  )}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">
                {typeof metric.value === "number" 
                  ? metric.value.toLocaleString() 
                  : metric.value}
              </span>
              {metric.changePercent !== undefined && (
                <span 
                  className={`ml-2 text-sm ${
                    metric.trend === "up" ? "text-green-500" : 
                    metric.trend === "down" ? "text-red-500" : 
                    "text-gray-500"
                  }`}
                >
                  {metric.changePercent > 0 ? "+" : ""}
                  {metric.changePercent}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

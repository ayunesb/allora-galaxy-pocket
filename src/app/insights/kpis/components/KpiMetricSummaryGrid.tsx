
import { Card } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { KpiAlert } from "@/types/kpi";

export interface MetricSummary {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  change: string;
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
        <Card key={metric.title} className="relative overflow-hidden border">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-medium text-sm text-muted-foreground">{metric.title}</h3>
              <div className="flex items-center">
                {metric.alerts.length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="bg-red-100 dark:bg-red-900/30 p-1 rounded-full mr-1">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{metric.alerts.length} active alert{metric.alerts.length > 1 ? 's' : ''}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <div className={`flex items-center ${
                  metric.trend === 'up' 
                    ? 'text-green-500' 
                    : metric.trend === 'down' 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4" /> 
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  <span className="ml-1 text-xs font-medium">
                    {metric.change}%
                  </span>
                </div>
              </div>
            </div>
            <div className="text-2xl font-bold">{metric.value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

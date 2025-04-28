
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import KpiMetricCard from "./components/KpiMetricCard";
import { useKpiMetrics } from "./hooks/useKpiMetrics";
import KpiLoadingState from "./components/KpiLoadingState";
import KpiErrorState from "./components/KpiErrorState";

interface KpiMetricCardProps {
  kpi_name?: string;
  value: number;
  target?: number;
  trend_direction?: 'up' | 'down' | 'neutral';
  trend?: 'up' | 'down' | 'neutral';
  last_value?: number;
}

export function KpiTracker() {
  const [dateRange, setDateRange] = useState("30");
  const { data: metrics, isLoading, error } = useKpiMetrics(dateRange);

  if (isLoading) return <KpiLoadingState />;
  if (error) return <KpiErrorState error={error} />;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">KPI Metrics</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metrics?.map((metric) => (
          <KpiMetricCard
            key={metric.id}
            kpi_name={metric.kpi_name}
            value={metric.value}
            target={metric.target}
            trend_direction={metric.trend_direction || metric.trend}
            last_value={metric.last_value}
          />
        ))}
      </div>
    </div>
  );
}

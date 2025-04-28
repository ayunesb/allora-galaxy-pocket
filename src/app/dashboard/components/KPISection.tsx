
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useKpiMetrics } from "@/hooks/useKpiMetrics"; 
import KpiCard from "@/app/insights/kpis/components/KpiCard";
import { KpiMetricDialog } from "@/app/dashboard/components/KpiMetricDialog"; 
import { DataLoader } from "@/components/ui/data-loader";

export function KPISection() {
  const { data: metrics, isLoading, error, refetch } = useKpiMetrics();
  
  const handleKpiSuccess = () => {
    refetch();
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>KPI Metrics</CardTitle>
        <KpiMetricDialog onSuccess={handleKpiSuccess} />
      </CardHeader>
      <CardContent>
        <DataLoader
          isLoading={isLoading}
          isError={!!error}
          error={error}
          data={metrics}
          onRetry={refetch}
          emptyState={
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No KPI metrics found</p>
              <KpiMetricDialog onSuccess={handleKpiSuccess}>
                <Button variant="outline" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add your first KPI metric
                </Button>
              </KpiMetricDialog>
            </div>
          }
        >
          {(metricsData) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {metricsData.map((metric, idx) => (
                <KpiCard 
                  key={metric.id || idx}
                  kpi_name={metric.kpi_name || metric.metric}
                  value={metric.value}
                  trend={metric.trend}
                />
              ))}
            </div>
          )}
        </DataLoader>
      </CardContent>
    </Card>
  );
}

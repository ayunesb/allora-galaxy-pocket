
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useKpiMetrics } from "@/hooks/useKpiMetrics"; 
import KpiCard from "@/app/insights/kpis/components/KpiCard";
import { KpiMetricDialog } from "@/app/dashboard/components/KpiMetricDialog"; 

export function KPISection() {
  const { data: metrics, isLoading, error, refetch } = useKpiMetrics();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>KPI Metrics</CardTitle>
        <KpiMetricDialog onSuccess={() => refetch()} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading KPI metrics...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-500">Error loading KPI metrics</div>
        ) : metrics && metrics.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, idx) => (
              <KpiCard 
                key={metric.id || idx}
                kpi_name={metric.kpi_name || metric.metric}
                value={metric.value}
                trend={metric.trend}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No KPI metrics found</p>
            <KpiMetricDialog>
              <Button variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add your first KPI metric
              </Button>
            </KpiMetricDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

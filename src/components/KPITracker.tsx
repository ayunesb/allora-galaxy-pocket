
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useKpiData } from '@/hooks/useKpiData';
import { Loader2 } from 'lucide-react';

// Define proper interfaces
export interface KPIData {
  name: string;
  value: number;
  target: number;
  percentChange?: number;
}

interface KPITrackerProps {
  data: KPIData[];
  loading?: boolean;
}

export function KPITracker({ data, loading = false }: KPITrackerProps) {
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>KPI Metrics</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>KPI Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((metric, index) => {
          // Ensure value is numeric
          const numericValue = typeof metric.value === 'string' ? parseFloat(metric.value) : metric.value;
          const numericTarget = typeof metric.target === 'string' ? parseFloat(metric.target) : metric.target;
          
          const progress = numericTarget ? (numericValue / numericTarget * 100) : 0;
          const cappedProgress = Math.min(100, Math.max(0, progress));

          return (
            <div key={`${metric.name}-${index}`} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">{metric.name}</span>
                <span className="text-sm text-muted-foreground">
                  {numericValue} / {numericTarget}
                  {metric.percentChange !== undefined && (
                    <span className={metric.percentChange >= 0 ? "text-green-500 ml-2" : "text-red-500 ml-2"}>
                      {metric.percentChange >= 0 ? '↑' : '↓'} {Math.abs(metric.percentChange)}%
                    </span>
                  )}
                </span>
              </div>
              <Progress value={cappedProgress} className="h-2" />
            </div>
          );
        })}

        {data.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No KPI metrics available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Create a wrapper that fetches data and passes it to the KPITracker
export function KPITrackerWithData() {
  const { data: kpiData, isLoading } = useKpiData();
  
  return <KPITracker data={kpiData || []} loading={isLoading} />;
}

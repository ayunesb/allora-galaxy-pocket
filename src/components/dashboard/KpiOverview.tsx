
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useKpiData } from "@/hooks/useKpiData";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface KpiMetric {
  id?: string;
  metric?: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
}

interface KpiTrend {
  metric: string;
  value: number;
  day: string;
}

interface FullKpiData {
  currentMetrics?: KpiMetric[];
  trends?: KpiTrend[];
}

export function KpiOverview() {
  const { data, isLoading } = useKpiData();
  
  // Safely extract metrics or use defaults
  const kpiData = data as unknown as FullKpiData | undefined;
  const currentMetrics: KpiMetric[] = kpiData?.currentMetrics || [];
  const trends: KpiTrend[] = kpiData?.trends || [];

  if (isLoading) {
    return <div>Loading KPI data...</div>;
  }

  if (!currentMetrics.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No KPI data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {currentMetrics.map((metric) => {
        const metricTrends = trends.filter(t => t.metric === metric.metric);
        const previousValue = metricTrends[metricTrends.length - 2]?.value || 0;
        const percentageChange = previousValue ? 
          ((metric.value - previousValue) / previousValue) * 100 : 0;

        return (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.metric}
              </CardTitle>
              <div className={`flex items-center ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {percentageChange >= 0 ? 
                  <ArrowUpIcon className="h-4 w-4" /> : 
                  <ArrowDownIcon className="h-4 w-4" />
                }
                <span className="text-xs ml-1">
                  {Math.abs(percentageChange).toFixed(1)}%
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-4">{metric.value}</div>
              <div className="h-[80px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metricTrends}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                      dot={false}
                    />
                    <XAxis dataKey="day" hide />
                    <YAxis hide />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

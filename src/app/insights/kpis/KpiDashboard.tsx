import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import KpiMetricCard from '@/app/dashboard/insights/components/KpiMetricCard';
import { KPITrackerWithData } from '@/components/KPITracker';
import InsightsDateFilter from '@/app/dashboard/insights/components/InsightsDateFilter';
import { AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { useKpiAlerts } from '@/hooks/useKpiAlerts';
import type { KpiAlert } from '@/types/kpi';
import KpiLoadingState from "./components/KpiLoadingState";
import KpiErrorState from "./components/KpiErrorState";
import KpiMetricSummaryGrid from "./components/KpiMetricSummaryGrid";
import KpiAlertsPanel from "./components/KpiAlertsPanel";

interface KpiMetric {
  id: string;
  metric: string;
  value: number;
  recorded_at: string;
}

export default function KpiDashboard() {
  const { tenant } = useTenant();
  const [dateRange, setDateRange] = useState("30");
  const [activeTab, setActiveTab] = useState('overview');

  const { 
    data: metrics = [], 
    isLoading: isLoadingMetrics, 
    error: metricsError 
  } = useQuery({
    queryKey: ['kpi-metrics', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('recorded_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching KPI metrics:", error);
        throw error;
      }
      
      return data as KpiMetric[] || [];
    },
    enabled: !!tenant?.id,
  });

  const { alerts, isLoading: isLoadingAlerts, error: alertsError } = useKpiAlerts();

  const isLoading = isLoadingMetrics || isLoadingAlerts;
  const error = metricsError || alertsError;

  const metricsByType = metrics.reduce((acc, metric) => {
    if (!acc[metric.metric]) {
      acc[metric.metric] = [];
    }
    acc[metric.metric].push(metric);
    return acc;
  }, {} as Record<string, KpiMetric[]>);

  const metricSummaries = Object.entries(metricsByType).map(([metricName, values]) => {
    try {
      const sortedValues = [...values].sort((a, b) => 
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      );
      
      const current = sortedValues[sortedValues.length - 1]?.value || 0;
      const previous = sortedValues[0]?.value || 0;
      
      const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;
      
      const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
      
      const metricAlerts = alerts.filter(alert => alert.metric === metricName);
      
      return {
        title: metricName,
        value: current.toFixed(1),
        trend,
        change: Math.abs(change).toFixed(1),
        alerts: metricAlerts
      };
    } catch (err) {
      console.error(`Error processing metric ${metricName}:`, err);
      return {
        title: metricName,
        value: "Error",
        trend: "neutral",
        change: "0",
        alerts: []
      };
    }
  });

  if (isLoading) {
    return <KpiLoadingState />;
  }

  if (error) {
    return <KpiErrorState error={error} />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">KPI Metrics Dashboard</h1>
        <InsightsDateFilter dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Detailed Charts</TabsTrigger>
          <TabsTrigger value="alerts">Alert Overlays</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <KpiMetricSummaryGrid metricSummaries={metricSummaries} />
        </TabsContent>

        <TabsContent value="charts">
          <Card>
            <CardHeader>
              <CardTitle>KPI Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent className="h-[500px]">
              <KPITrackerWithData />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <KpiAlertsPanel alerts={alerts} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

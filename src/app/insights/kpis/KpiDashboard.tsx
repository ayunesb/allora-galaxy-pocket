
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { KPITrackerWithData } from '@/components/KPITracker';
import InsightsDateFilter from '@/app/dashboard/insights/components/InsightsDateFilter';
import { useKpiAlerts } from '@/hooks/useKpiAlerts';
import KpiLoadingState from "./components/KpiLoadingState";
import KpiErrorState from "./components/KpiErrorState";
import KpiMetricSummaryGrid from "./components/KpiMetricSummaryGrid";
import KpiAlertsPanel from "./components/KpiAlertsPanel";
import { useMetricSummaries } from './hooks/useMetricSummaries';

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
  const metricSummaries = useMetricSummaries(metrics, alerts);

  const isLoading = isLoadingMetrics || isLoadingAlerts;
  const error = metricsError || alertsError;

  if (isLoading) {
    return <KpiLoadingState />;
  }

  if (error) {
    return <KpiErrorState error={error} />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
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

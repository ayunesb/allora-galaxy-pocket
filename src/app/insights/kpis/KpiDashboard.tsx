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
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin h-8 w-8 mb-2" />
          <p className="text-muted-foreground">Loading KPI metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="py-6">
            <div className="flex items-center">
              <AlertCircle className="text-red-500 h-6 w-6 mr-2" />
              <p className="text-red-500 font-medium">
                Error loading KPI data: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
            <p className="mt-2 text-sm text-red-400">Please try refreshing the page or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    );
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
          {metricSummaries.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {metricSummaries.map((metric) => (
                <div key={metric.title} className="relative">
                  <KpiMetricCard
                    title={metric.title}
                    value={metric.value}
                    trend={metric.trend as 'up' | 'down' | 'neutral'}
                    change={Number(metric.change)}
                  />
                  {metric.alerts.length > 0 && (
                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No KPI metrics found. Start by creating some metrics in the settings page.</p>
            </div>
          )}
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
          <Card>
            <CardHeader>
              <CardTitle>KPI Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`p-4 border rounded-lg flex justify-between items-center
                        ${alert.status === 'triggered' ? 'border-red-300 bg-red-50' : 
                          alert.status === 'resolved' ? 'border-green-300 bg-green-50' : 'border-yellow-300 bg-yellow-50'}`}
                    >
                      <div>
                        <h3 className="font-medium">
                          {alert.metric} {alert.condition === 'above' ? '>' : '<'} {alert.threshold}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className={
                            alert.status === 'triggered' ? 'text-red-500 font-bold' : 
                            alert.status === 'resolved' ? 'text-green-500 font-bold' : ''
                          }>
                            {alert.status}
                          </span>
                        </p>
                      </div>
                      {alert.triggered_at && (
                        <span className="text-sm text-muted-foreground">
                          {alert.status === 'triggered' ? 'Triggered' : 'Last triggered'} at: {new Date(alert.triggered_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No KPI alerts configured</p>
                  <p className="text-sm mt-2">Set up alerts in the KPI settings page to receive notifications when metrics cross thresholds.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

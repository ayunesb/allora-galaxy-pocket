
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import KpiMetricCard from '@/app/dashboard/insights/components/KpiMetricCard';
import { KPITrackerWithData } from '@/components/KPITracker';
import InsightsDateFilter from '@/app/dashboard/insights/components/InsightsDateFilter';
import { AlertTriangle } from 'lucide-react';

interface KpiAlert {
  id: string;
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  triggered_at?: string;
  status: 'active' | 'triggered' | 'resolved';
}

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

  const { data: metrics = [] } = useQuery({
    queryKey: ['kpi-metrics', tenant?.id, dateRange],
    queryFn: async () => {
      const { data } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant?.id)
        .order('recorded_at', { ascending: false });
      return data as KpiMetric[] || [];
    },
    enabled: !!tenant?.id,
  });

  const { data: alerts = [] } = useQuery({
    queryKey: ['kpi-alerts', tenant?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('kpi_alerts')
        .select('*')
        .eq('tenant_id', tenant?.id);
      return data as KpiAlert[] || [];
    },
    enabled: !!tenant?.id,
  });

  // Group metrics by type
  const metricsByType = metrics.reduce((acc, metric) => {
    if (!acc[metric.metric]) {
      acc[metric.metric] = [];
    }
    acc[metric.metric].push(metric);
    return acc;
  }, {} as Record<string, KpiMetric[]>);

  // Calculate trend for each metric type
  const metricSummaries = Object.entries(metricsByType).map(([metricName, values]) => {
    // Sort by recorded_at in ascending order
    const sortedValues = [...values].sort((a, b) => 
      new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
    );
    
    // Get current and previous values
    const current = sortedValues[sortedValues.length - 1]?.value || 0;
    const previous = sortedValues[0]?.value || 0;
    
    // Calculate change
    const change = previous === 0 ? 0 : ((current - previous) / previous) * 100;
    
    // Determine trend
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    // Find any alerts for this metric
    const metricAlerts = alerts.filter(alert => alert.metric === metricName);
    
    return {
      title: metricName,
      value: current.toFixed(1),
      trend,
      change: Math.abs(change).toFixed(1),
      alerts: metricAlerts
    };
  });

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
                    <div key={alert.id} className="p-4 border rounded-lg flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {alert.metric} {alert.condition === 'above' ? '>' : '<'} {alert.threshold}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className={alert.status === 'triggered' ? 'text-red-500 font-bold' : ''}>
                            {alert.status}
                          </span>
                        </p>
                      </div>
                      {alert.triggered_at && (
                        <span className="text-sm text-muted-foreground">
                          Triggered at: {new Date(alert.triggered_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No KPI alerts configured
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

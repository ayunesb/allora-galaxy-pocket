import { Card, CardContent } from "@/components/ui/card";
import { KPITrackerWithData } from "@/components/KPITracker";
import { KpiCampaignTracker } from "@/components/KpiCampaignTracker";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { RefreshCw, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { KPIChart } from "@/components/KPIChart";
import { format, subDays } from "date-fns";

type KPITrendsData = {
  [metricName: string]: Array<{ date: string; value: number }>;
};

export function KPISection() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trendTimeframe, setTrendTimeframe] = useState("7"); // default to 7 days
  
  const { data: kpiAlerts } = useQuery({
    queryKey: ['kpi-alerts', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_alerts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id,
  });

  const { data: kpiTrends } = useQuery<KPITrendsData>({
    queryKey: ['kpi-trends', tenant?.id, trendTimeframe],
    queryFn: async () => {
      if (!tenant?.id) return {};
      
      const startDate = subDays(new Date(), parseInt(trendTimeframe)).toISOString();
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('recorded_at', startDate)
        .order('recorded_at', { ascending: true });
        
      if (error) throw error;
      
      // Group metrics by name for trend visualization
      const groupedMetrics: KPITrendsData = {};
      
      if (data) {
        data.forEach(metric => {
          if (!groupedMetrics[metric.metric]) {
            groupedMetrics[metric.metric] = [];
          }
          
          groupedMetrics[metric.metric].push({
            date: format(new Date(metric.recorded_at), 'MM/dd'),
            value: Number(metric.value)
          });
        });
      }
      
      return groupedMetrics;
    },
    enabled: !!tenant?.id,
  });

  const refreshKPIMetrics = async () => {
    if (!tenant?.id || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await supabase.functions.invoke('check-kpi-alerts', {
        body: { tenant_id: tenant.id }
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['kpi-trends'] });
      
      toast.success("KPI metrics refreshed successfully");
    } catch (error) {
      console.error("Error refreshing KPI metrics:", error);
      toast.error("Failed to refresh KPI metrics");
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTopMetric = () => {
    if (!kpiTrends || Object.keys(kpiTrends).length === 0) return null;
    
    let bestMetric = null;
    let highestGrowth = -Infinity;
    
    Object.entries(kpiTrends).forEach(([name, values]) => {
      if (!values || values.length < 2) return;
      
      const firstValue = values[0].value;
      const lastValue = values[values.length - 1].value;
      
      if (firstValue === 0) return; // Avoid division by zero
      
      const growth = ((lastValue - firstValue) / firstValue) * 100;
      
      if (growth > highestGrowth) {
        highestGrowth = growth;
        bestMetric = {
          name,
          growth: growth.toFixed(1),
          data: values
        };
      }
    });
    
    return bestMetric;
  };

  const topMetric = getTopMetric();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Key Performance Indicators</h3>
              <div className="flex gap-2">
                <select
                  className="px-2 py-1 text-sm border rounded bg-background"
                  value={trendTimeframe}
                  onChange={(e) => setTrendTimeframe(e.target.value)}
                >
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                </select>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshKPIMetrics} 
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
            <KPITrackerWithData />
            
            {topMetric && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    Top Performing Metric: {topMetric.name}
                  </h4>
                  <span className="text-green-500 text-sm font-medium">+{topMetric.growth}%</span>
                </div>
                <div className="h-[150px]">
                  <KPIChart data={topMetric.data} />
                </div>
              </div>
            )}
            
            {kpiAlerts && kpiAlerts.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium flex items-center mb-2">
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  Active Alerts
                </h4>
                <div className="space-y-2">
                  {kpiAlerts.map(alert => (
                    <div key={alert.id} className="text-sm p-2 bg-amber-50 border border-amber-100 rounded-md">
                      {alert.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <div>
        <KpiCampaignTracker onUpdate={() => {
          queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
          queryClient.invalidateQueries({ queryKey: ['kpi-trends'] });
        }} />
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Quick Actions</h3>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate KPI Report
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Configure Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import KpiMetricDialog from "./KpiMetricDialog";
import { KpiAlert } from "@/types/kpi";

export default function KPISection() {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<KpiAlert[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const { tenant } = useTenant();

  useEffect(() => {
    const fetchData = async () => {
      if (!tenant?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('kpi_metrics')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('updated_at', { ascending: false });

        if (metricsError) throw metricsError;
        
        // Create a SQL function to alert user if this table doesn't exist
        try {
          // Safely attempt to fetch alerts
          const { data: alertsData } = await supabase
            .from('kpi_alerts')
            .select('*')
            .eq('tenant_id', tenant.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
            
          if (alertsData && alertsData.length > 0) {
            setAlerts(alertsData as KpiAlert[]);
          }
        } catch (alertError) {
          console.log("KPI alerts table might not exist yet or other error:", alertError);
          // No need to throw - we'll just have empty alerts
        }
        
        setMetrics(metricsData || []);
      } catch (error) {
        console.error("Error fetching KPI data:", error);
        toast.error("Failed to load KPI data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tenant?.id]);

  const acknowledgeAlert = async (alertId: string) => {
    if (!tenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('kpi_alerts')
        .update({ status: 'acknowledged' })
        .eq('id', alertId)
        .eq('tenant_id', tenant.id);
        
      if (error) throw error;
      
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success("Alert acknowledged");
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      toast.error("Failed to acknowledge alert");
    }
  };

  const handleAddMetric = (metricName: string) => {
    setSelectedMetric(metricName);
    setIsDialogOpen(true);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  const getPercentChange = (metric: any) => {
    const metricHistory = metrics.filter(m => m.metric === metric.metric);
    if (metricHistory.length > 1) {
      const current = metric.value;
      const previous = metricHistory[1].value;
      if (previous === 0) return null;
      return ((current - previous) / previous) * 100;
    }
    return null;
  };

  const renderMetricCards = () => {
    // Group by metric name and get the latest for each metric
    const uniqueMetrics: Record<string, any> = {};
    metrics.forEach(metric => {
      if (!uniqueMetrics[metric.metric] || 
          new Date(metric.updated_at) > new Date(uniqueMetrics[metric.metric].updated_at)) {
        uniqueMetrics[metric.metric] = metric;
      }
    });
    
    return Object.values(uniqueMetrics).map((metric: any) => {
      const percentChange = getPercentChange(metric);
      const isPositive = percentChange && percentChange > 0;
      const isNegative = percentChange && percentChange < 0;
      
      return (
        <Card key={metric.id} className="overflow-hidden">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">{metric.metric}</CardTitle>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex justify-between items-baseline">
              <h3 className="text-2xl font-bold">{formatValue(metric.value)}</h3>
              {percentChange !== null && (
                <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : ''}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : 
                   isNegative ? <TrendingDown className="h-3 w-3 mr-1" /> : null}
                  {Math.abs(percentChange).toFixed(1)}%
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">KPI Metrics</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsDialogOpen(true)}
        >
          Add Metric
        </Button>
      </div>
      
      {alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className="flex items-center justify-between p-2 bg-amber-50 border border-amber-200 rounded-md"
            >
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm">{alert.message}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => acknowledgeAlert(alert.id)}
              >
                Dismiss
              </Button>
            </div>
          ))}
        </div>
      )}
      
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="py-3">
                <div className="h-4 bg-gray-200 rounded-full w-2/3" />
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-6 bg-gray-200 rounded-full w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : metrics.length === 0 ? (
        <div className="bg-muted/50 border rounded-lg p-6 text-center">
          <p className="text-muted-foreground mb-2">No KPI metrics available yet</p>
          <Button onClick={() => setIsDialogOpen(true)}>Add Your First Metric</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {renderMetricCards()}
        </div>
      )}
      
      <KpiMetricDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedMetric={selectedMetric}
        onSelectMetric={setSelectedMetric}
      />
    </div>
  );
}

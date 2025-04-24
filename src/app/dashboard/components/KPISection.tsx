
import { Card, CardContent } from "@/components/ui/card";
import { KPITrackerWithData } from "@/components/KPITracker";
import { KpiCampaignTracker } from "@/components/KpiCampaignTracker";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function KPISection() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
      
      toast.success("KPI metrics refreshed successfully");
    } catch (error) {
      console.error("Error refreshing KPI metrics:", error);
      toast.error("Failed to refresh KPI metrics");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Key Performance Indicators</h3>
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
            <KPITrackerWithData />
            
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
        <KpiCampaignTracker onUpdate={() => queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] })} />
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { useUnifiedKpiAlerts } from '@/hooks/useUnifiedKpiAlerts';
import { useTenant } from '@/hooks/useTenant';
import { toast } from '@/components/ui/sonner';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ChartLine, Activity, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function GrowthPanel() {
  const { tenant } = useTenant();
  const { 
    alerts, 
    isLoading,
    fetchAlerts,
    triggerKpiCheck 
  } = useUnifiedKpiAlerts();
  
  useEffect(() => {
    const refreshData = async () => {
      try {
        if (tenant?.id) {
          await fetchAlerts();
        }
      } catch (error) {
        console.error('Failed to refresh alerts:', error);
      }
    };

    refreshData();
  }, [fetchAlerts, tenant?.id]);

  const handleRunAnalysis = async () => {
    if (tenant?.id) {
      await triggerKpiCheck(tenant.id);
    } else {
      toast.error("No tenant selected");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartLine className="h-5 w-5 text-primary" />
            Growth Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="p-4 border rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                    <div>
                      <p className="font-medium">{alert.kpi_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      {alert.created_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No growth alerts</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Run a KPI analysis to get insights about your campaigns and performance metrics.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleRunAnalysis} 
            className="w-full" 
            disabled={isLoading || !tenant?.id}
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 mr-2" />
                Run KPI Analysis
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

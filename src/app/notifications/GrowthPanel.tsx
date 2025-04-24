
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, RefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useKpiAlerts } from "@/hooks/useKpiAlerts";

export default function GrowthPanel() {
  const { alerts, campaignInsights, isLoading, refreshAlerts, triggerKpiCheck } = useKpiAlerts({ 
    days: 30,
    activeOnly: true 
  });

  // Run a KPI check if we have no alerts when the component mounts
  useEffect(() => {
    if (!isLoading && alerts.length === 0) {
      triggerKpiCheck();
    }
  }, [isLoading]);
  
  const handleRefresh = async () => {
    await triggerKpiCheck();
    refreshAlerts();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getChangeIndicator = (percentChange: number) => {
    if (percentChange > 0) {
      return <ArrowUpCircle className="h-5 w-5 text-green-500" />;
    } else if (percentChange < 0) {
      return <ArrowDownCircle className="h-5 w-5 text-red-500" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Growth Alerts</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            KPI and performance insights requiring attention
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No active alerts at this time</p>
            <Button variant="outline" className="mt-4" onClick={handleRefresh}>
              Run KPI Check
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'outline'}>
                      {alert.severity}
                    </Badge>
                    <h3 className="font-medium">{alert.kpi_name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    {getChangeIndicator(alert.percent_change || 0)}
                    <span className={`text-sm ${alert.percent_change && alert.percent_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {alert.percent_change ? `${Math.abs(alert.percent_change).toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">
                  {alert.description || 'No description available'}
                </p>
                
                <div className="flex justify-between text-sm mt-2">
                  <div>
                    <span className="text-muted-foreground">Current:</span>{' '}
                    <span className="font-medium">{alert.current_value}</span>
                  </div>
                  {alert.target && (
                    <div>
                      <span className="text-muted-foreground">Target:</span>{' '}
                      <span className="font-medium">{alert.target}</span>
                    </div>
                  )}
                  {alert.previous_value !== null && (
                    <div>
                      <span className="text-muted-foreground">Previous:</span>{' '}
                      <span className="font-medium">{alert.previous_value}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {campaignInsights.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-medium mb-2">Campaign Alerts</h3>
                  {campaignInsights.map((insight) => (
                    <div key={insight.id} className="border rounded-lg p-4 mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{insight.campaigns.name}</span>
                        <Badge>{insight.campaigns.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

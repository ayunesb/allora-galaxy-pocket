
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiAlert } from "@/types/kpi";

interface KpiAlertsPanelProps {
  alerts: KpiAlert[];
  kpiName?: string;
}

export function KpiAlertsPanel({ alerts = [], kpiName }: KpiAlertsPanelProps) {
  // Filter alerts by kpiName if provided
  const filteredAlerts = kpiName 
    ? alerts.filter(alert => alert.kpi_name === kpiName)
    : alerts;

  const getBadgeVariant = (severity: KpiAlert['severity']) => {
    switch (severity) {
      case 'low': return "secondary";
      case 'medium': return "outline";
      case 'high': return "destructive";
      default: return "default";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No alerts to display</p>
          ) : (
            filteredAlerts
              .filter((alert) => alert.status === "pending") // Show pending alerts
              .slice(0, 3)
              .map((alert) => (
                <div key={alert.id} className="bg-muted/50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{alert.kpi_name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    </div>
                    <Badge variant={getBadgeVariant(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

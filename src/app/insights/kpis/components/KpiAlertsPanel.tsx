
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { KpiAlert } from "@/types/kpi";
import { format } from "date-fns";

interface KpiAlertsPanelProps {
  alerts: KpiAlert[];
}

export default function KpiAlertsPanel({ alerts }: KpiAlertsPanelProps) {
  if (!alerts?.length) {
    return (
      <div className="text-center p-8 bg-slate-50 rounded-lg">
        <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-4 opacity-70" />
        <h3 className="text-lg font-medium mb-2">No active alerts</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Set up KPI threshold alerts to be notified when metrics exceed or fall below specified values.
        </p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
          KPI Alerts ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className="p-4 border rounded-lg flex justify-between items-start"
            >
              <div>
                <div className="font-medium mb-1">
                  {alert.metric} {alert.condition === 'above' ? '>' : '<'} {alert.threshold}
                </div>
                <div className="text-sm text-muted-foreground">
                  {alert.triggered_at ? (
                    <span>Triggered {format(new Date(alert.triggered_at), 'MMM d, yyyy')}</span>
                  ) : (
                    <span>Added {format(new Date(alert.created_at || Date.now()), 'MMM d, yyyy')}</span>
                  )}
                </div>
              </div>
              <Badge 
                variant={
                  alert.status === 'triggered' ? 'destructive' : 
                  alert.status === 'resolved' ? 'outline' : 
                  'secondary'
                }
              >
                {alert.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

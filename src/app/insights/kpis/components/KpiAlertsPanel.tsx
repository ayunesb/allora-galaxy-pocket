
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { KpiAlert } from "@/types/kpi";

interface KpiAlertsPanelProps {
  alerts: KpiAlert[];
}

export default function KpiAlertsPanel({ alerts }: KpiAlertsPanelProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>KPI Alerts</CardTitle>
        <Badge variant="outline" className="ml-2">
          {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
        </Badge>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 border rounded-lg flex justify-between items-center
                  ${alert.status === 'triggered'
                    ? 'border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800'
                    : alert.status === 'resolved'
                    ? 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800'
                    : 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800'
                  }`
                }
              >
                <div className="flex gap-3 items-center">
                  {alert.status === 'triggered' ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : alert.status === 'resolved' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" /> 
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <div>
                    <h3 className="font-medium">
                      {alert.metric} {alert.condition === 'above' ? '>' : '<'} {alert.threshold}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Status:{" "}
                      <span
                        className={
                          alert.status === "triggered"
                            ? "text-red-500 font-bold"
                            : alert.status === "resolved"
                            ? "text-green-500 font-bold"
                            : "text-yellow-500 font-bold"
                        }
                      >
                        {alert.status}
                      </span>
                    </p>
                  </div>
                </div>
                {alert.triggered_at && (
                  <span className="text-sm text-muted-foreground">
                    {alert.status === "triggered" ? "Triggered" : "Last triggered"} at:{" "}
                    {new Date(alert.triggered_at).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="mx-auto h-8 w-8 text-muted-foreground opacity-50 mb-2" />
            <p>No KPI alerts configured</p>
            <p className="text-sm mt-2">
              Set up alerts in the KPI settings page to receive notifications when metrics cross thresholds.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

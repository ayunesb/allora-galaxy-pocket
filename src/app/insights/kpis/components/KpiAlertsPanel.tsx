
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { KpiAlert } from "@/types/kpi";

interface KpiAlertsPanelProps {
  alerts: KpiAlert[];
}

export default function KpiAlertsPanel({ alerts }: KpiAlertsPanelProps) {
  return (
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
                  ${alert.status === 'triggered'
                    ? 'border-red-300 bg-red-50'
                    : alert.status === 'resolved'
                    ? 'border-green-300 bg-green-50'
                    : 'border-yellow-300 bg-yellow-50'
                  }`
                }
              >
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
                          : ""
                      }
                    >
                      {alert.status}
                    </span>
                  </p>
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

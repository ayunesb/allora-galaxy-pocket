
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useKpiAlerts } from '@/hooks/useKpiAlerts';

export function KpiAlerts() {
  const { alerts } = useKpiAlerts({ activeOnly: true });

  if (!alerts?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id}>
            <AlertTitle>{alert.kpi_name}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
            {alert.message && (
              <p className="text-sm mt-2">{alert.message}</p>
            )}
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}

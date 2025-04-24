
import React from 'react';
import { useSystemHealthMetrics } from '@/hooks/useSystemHealthMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { formatDistance } from 'date-fns';

export function SystemHealthMetrics() {
  const { metrics, cronJobMetrics, systemHealthAlerts, isLoading, error } = useSystemHealthMetrics();

  if (isLoading) return <div>Loading system health metrics...</div>;
  if (error) return <div>Error loading system health metrics</div>;

  return (
    <div className="space-y-4">
      {systemHealthAlerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Active System Alerts</h3>
          {systemHealthAlerts.map((alert) => (
            <Alert key={alert.id} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{alert.alert_type}</AlertTitle>
              <AlertDescription>{alert.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <h3 className="text-lg font-semibold">CRON Job Metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cronJobMetrics.map((metric) => (
          <Card key={metric.function_name}>
            <CardHeader>
              <CardTitle>{metric.function_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Success Rate</span>
                <Badge variant={metric.success_rate >= 90 ? 'default' : 'destructive'}>
                  {metric.success_rate.toFixed(2)}%
                </Badge>
              </div>
              <Progress value={metric.success_rate} className="h-2" />
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Executions</span>
                  <div>{metric.total_executions}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Errors</span>
                  <div>{metric.error_count}</div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Last Execution: {formatDistance(new Date(metric.last_execution_at), new Date(), { addSuffix: true })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

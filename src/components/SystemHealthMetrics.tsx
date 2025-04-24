
import React from 'react';
import { useSystemHealthMetrics } from '@/hooks/useSystemHealthMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SystemHealthMetrics() {
  const { metrics, cronJobMetrics, systemHealthAlerts, isLoading, error, refetch } = useSystemHealthMetrics();

  if (isLoading) return (
    <div className="flex items-center justify-center p-6">
      <Loader2 className="h-8 w-8 animate-spin" />
      <span className="ml-2">Loading system health metrics...</span>
    </div>
  );
  
  if (error) return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading system health metrics</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>{(error as Error).message}</p>
        <button 
          className="bg-primary text-primary-foreground px-3 py-1 rounded text-sm w-fit"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </AlertDescription>
    </Alert>
  );

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
          <Card key={metric.id || metric.function_name}>
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
                Last Execution: {formatDistanceToNow(new Date(metric.last_execution_at), { addSuffix: true })}
              </div>
            </CardContent>
          </Card>
        ))}
        {cronJobMetrics.length === 0 && (
          <div className="col-span-full flex items-center justify-center p-6 border rounded-lg">
            <p className="text-muted-foreground">No CRON job metrics available</p>
          </div>
        )}
      </div>

      {metrics.length > 0 && (
        <>
          <h3 className="text-lg font-semibold mt-6">System Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{metric.metric_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-muted-foreground">
                    Last updated: {formatDistanceToNow(new Date(metric.recorded_at), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

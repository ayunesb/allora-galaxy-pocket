
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useUnifiedKpiAlerts, UnifiedKpiAlert } from '@/hooks/useUnifiedKpiAlerts';
import { RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface KpiAlertsPanelProps {
  alerts?: UnifiedKpiAlert[];
  isCompact?: boolean;
}

export function KpiAlertsPanel({ alerts: externalAlerts, isCompact = false }: KpiAlertsPanelProps) {
  const { 
    alerts: fetchedAlerts,
    isLoading,
    triggerKpiCheck
  } = useUnifiedKpiAlerts({ 
    activeOnly: true,
    days: 7
  });
  
  const alerts = externalAlerts || fetchedAlerts;
  
  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  if (!alerts?.length) {
    if (isCompact) return null;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>KPI Alerts</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground mb-4">No active alerts</p>
          <Button 
            onClick={() => triggerKpiCheck()} 
            variant="outline" 
            size="sm" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Check KPIs
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>KPI Alerts</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => triggerKpiCheck()}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.slice(0, isCompact ? 3 : undefined).map((alert) => (
          <Alert key={alert.id} className={getSeverityClass(alert.severity)}>
            <AlertTitle className="flex justify-between">
              {alert.kpi_name}
              <span className="text-xs opacity-70">
                {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
              </span>
            </AlertTitle>
            <AlertDescription>
              {alert.description}
              {alert.message && (
                <p className="mt-2 text-sm font-medium">
                  Action: {alert.message}
                </p>
              )}
            </AlertDescription>
          </Alert>
        ))}
        
        {isCompact && alerts.length > 3 && (
          <div className="text-center">
            <Button variant="link" size="sm">
              View all {alerts.length} alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

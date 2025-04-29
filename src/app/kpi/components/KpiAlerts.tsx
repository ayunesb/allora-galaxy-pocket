import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useUnifiedKpiAlerts } from '@/hooks/useUnifiedKpiAlerts';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function KpiAlerts() {
  const { data: alerts, isLoading } = useUnifiedKpiAlerts({ activeOnly: true });
  const navigate = useNavigate();

  if (!alerts?.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.slice(0, 5).map((alert) => (
          <Alert key={alert.id}>
            <AlertTitle>{alert.kpi_name}</AlertTitle>
            <AlertDescription>{alert.description}</AlertDescription>
            {alert.message && (
              <p className="text-sm mt-2">{alert.message}</p>
            )}
          </Alert>
        ))}
        
        {alerts.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full flex justify-center items-center text-sm"
            onClick={() => navigate('/insights/alerts')}
          >
            View all {alerts.length} alerts
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

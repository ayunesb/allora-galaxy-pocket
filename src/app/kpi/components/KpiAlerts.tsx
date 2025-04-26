
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function KpiAlerts() {
  const { tenant } = useTenant();
  
  const { data: alerts } = useQuery({
    queryKey: ['kpi-alerts', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data } = await supabase
        .from('kpi_insights')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      return data || [];
    },
    enabled: !!tenant?.id
  });

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
            <AlertDescription>{alert.insight}</AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}

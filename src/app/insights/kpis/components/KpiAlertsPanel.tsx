import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { KpiAlert } from "@/types/kpi";

interface KpiAlertsPanelProps {
  kpiName: string;
}

export function KpiAlertsPanel({ kpiName }: KpiAlertsPanelProps) {
  const { tenant } = useTenant();

  const { data: alerts, isLoading, error } = useQuery({
    queryKey: ['kpi-alerts', kpiName],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from('kpi_alerts')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('kpi_name', kpiName)
        .order('triggered_at', { ascending: false });

      if (error) {
        console.error("Error fetching KPI alerts:", error);
        return [];
      }

      return data as KpiAlert[];
    },
    enabled: !!tenant?.id && !!kpiName,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const getBadgeVariant = (severity: KpiAlert['severity']) => {
    switch (severity) {
      case 'low': return "secondary";
      case 'medium': return "outline";
      case 'high': return "destructive";
      default: return "default";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          Loading alerts...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          Error loading alerts.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts
            .filter((alert) => alert.status === "pending") // Changed from "triggered"
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
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

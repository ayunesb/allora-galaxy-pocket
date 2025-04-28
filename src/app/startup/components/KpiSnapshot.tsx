
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Loader2 } from "lucide-react";
import KpiCard from "../KpiCard";
import { KpiMetricDialog } from "@/app/dashboard/components/KpiMetricDialog";
import type { KpiMetric } from "@/types/kpi";

export function KpiSnapshot() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['kpi-metrics', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      
      return data.map(m => ({
        label: m.metric,
        value: m.value,
        trend: (m.value > 0 ? "up" : "down") as "up" | "down", 
        changePercent: 0
      }));
    },
    enabled: !!tenant?.id
  });

  const handleMetricUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>📊 KPI Snapshot</CardTitle>
        <KpiMetricDialog onSuccess={handleMetricUpdate} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : metrics && metrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((metric, index) => (
              <KpiCard
                key={index}
                id={`metric-${index}`}
                kpi_name={metric.label || ''}
                tenant_id={tenant?.id || ''}
                updated_at={new Date().toISOString()}
                created_at={new Date().toISOString()} 
                label={metric.label}
                value={metric.value}
                trend={metric.trend}
                changePercent={metric.changePercent}
                onUpdate={handleMetricUpdate}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No KPIs configured yet. Add your first KPI metric to get started.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

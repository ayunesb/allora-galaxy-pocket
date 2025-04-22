
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Loader2 } from "lucide-react";
import KpiCard from "../KpiCard";

export function KpiSnapshot() {
  const { tenant } = useTenant();

  const { data: kpiMetrics, isLoading } = useQuery({
    queryKey: ['kpi-snapshot', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .limit(4);

      if (error) throw error;
      
      return data.map(metric => ({
        label: metric.metric,
        value: metric.value,
        trend: Math.random() > 0.5 ? "up" : "down" // Mock trend until we have historical data
      }));
    },
    enabled: !!tenant?.id
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>📊 KPI Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin h-6 w-6" />
          </div>
        ) : kpiMetrics && kpiMetrics.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {kpiMetrics.map((metric, index) => (
              <KpiCard
                key={index}
                label={metric.label}
                value={metric.value}
                trend={metric.trend}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No metrics available yet</p>
        )}
      </CardContent>
    </Card>
  );
}

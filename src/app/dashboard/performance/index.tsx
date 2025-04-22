
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import PerformanceDashboard from "./PerformanceDashboard";

export default function PerformancePage() {
  const { tenant } = useTenant();

  const { data: metrics } = useQuery({
    queryKey: ['performance-metrics', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      
      // Transform DB metrics to performance metrics format
      const result = [
        { name: "Impressions", value: 0 },
        { name: "Clicks", value: 0 },
        { name: "CTR", value: "0%" },
        { name: "Conversions", value: 0 },
        { name: "Cost", value: "$0" },
        { name: "ROI", value: "0x" }
      ];
      
      if (data) {
        data.forEach(metric => {
          const index = result.findIndex(m => m.name.toLowerCase() === metric.metric.toLowerCase());
          if (index !== -1) {
            let value = metric.value;
            // Format as percentage if needed
            if (metric.metric.toLowerCase() === "ctr") {
              value = `${metric.value}%`;
            }
            // Format as currency if needed
            if (metric.metric.toLowerCase() === "cost") {
              value = `$${metric.value}`;
            }
            // Format as multiplier if needed
            if (metric.metric.toLowerCase() === "roi") {
              value = `${metric.value}x`;
            }
            result[index].value = value;
          }
        });
      }
      
      return result;
    },
    enabled: !!tenant?.id
  });

  return (
    <PerformanceDashboard metrics={metrics || []} />
  );
}

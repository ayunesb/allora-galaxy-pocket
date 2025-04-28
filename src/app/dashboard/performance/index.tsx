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
            // For numerical metrics, parse as number
            if (["Impressions", "Clicks", "Conversions"].includes(result[index].name)) {
              result[index].value = parseInt(metric.value.toString(), 10);
            }
            // For percentage/formatted metrics, keep as string
            else if (["CTR", "Cost", "ROI"].includes(result[index].name)) {
              let value = metric.value.toString();
              // Format as percentage if needed
              if (result[index].name === "CTR") {
                value = `${value}%`;
              }
              // Format as currency if needed
              if (result[index].name === "Cost") {
                value = `$${value}`;
              }
              // Format as multiplier if needed
              if (result[index].name === "ROI") {
                value = `${value}x`;
              }
              result[index].value = value;
            }
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

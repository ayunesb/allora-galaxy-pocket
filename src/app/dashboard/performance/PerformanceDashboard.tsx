
import { useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { StatusIndicator } from "./StatusIndicator";
import { RecommendationCard } from "./RecommendationCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

interface Metric {
  name: string;
  value: string | number;
}

interface PerformanceDashboardProps {
  metrics: Metric[];
}

export default function PerformanceDashboard({ metrics }: PerformanceDashboardProps) {
  const { tenant } = useTenant();
  const [status, setStatus] = useState<"green" | "yellow" | "red">("green");

  const { data: recommendationData } = useQuery({
    queryKey: ['performance-recommendation', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      
      const { data, error } = await supabase
        .from('system_logs')
        .select('message')
        .eq('tenant_id', tenant.id)
        .eq('event_type', 'performance_recommendation')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data?.message || "💡 Try a TikTok retargeting video with a stronger CTA";
    },
    enabled: !!tenant?.id
  });

  useEffect(() => {
    // Determine status based on conversions metric
    const conversions = metrics.find(m => m.name === "Conversions")?.value;
    if (typeof conversions === 'number') {
      if (conversions < 200) setStatus("red");
      else if (conversions < 300) setStatus("yellow");
      else setStatus("green");
    }
  }, [metrics]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">📈 Strategy Performance</h2>

      <div className="grid md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <MetricCard 
            key={metric.name}
            name={metric.name}
            value={metric.value}
          />
        ))}
      </div>

      <StatusIndicator status={status} />
      <RecommendationCard recommendation={recommendationData || ""} />
    </div>
  );
}

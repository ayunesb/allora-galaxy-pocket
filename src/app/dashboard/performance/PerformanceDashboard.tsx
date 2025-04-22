
import { useState, useEffect } from "react";
import { MetricCard } from "./MetricCard";
import { StatusIndicator } from "./StatusIndicator";
import { RecommendationCard } from "./RecommendationCard";

interface Metric {
  name: string;
  value: string | number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { name: "Impressions", value: 24500 },
    { name: "Clicks", value: 3450 },
    { name: "CTR", value: "14.1%" },
    { name: "Conversions", value: 392 },
    { name: "Cost", value: "$298" },
    { name: "ROI", value: "3.5x" }
  ]);

  const [status, setStatus] = useState<"green" | "yellow" | "red">("green");
  const [next, setNext] = useState("💡 Try a TikTok retargeting video with a stronger CTA");

  useEffect(() => {
    const conversions = Number(metrics[3].value);
    if (conversions < 200) setStatus("red");
    else if (conversions < 300) setStatus("yellow");
    else setStatus("green");
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
      <RecommendationCard recommendation={next} />
    </div>
  );
}

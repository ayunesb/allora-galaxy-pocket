
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { KpiMetric } from "@/types/kpi";

export default function KpiCard({ label, value, trend, changePercent, onUpdate }: KpiMetric & { onUpdate?: () => void }) {
  // Ensure we parse the value to number for display
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <p className="text-sm text-muted-foreground">{label}</p>
          <div className="flex items-center gap-2">
            {trend && (
              <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
                {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {changePercent && <span className="ml-1 text-xs">{changePercent}%</span>}
              </span>
            )}
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-2">{numericValue}</h2>
      </CardContent>
    </Card>
  );
}

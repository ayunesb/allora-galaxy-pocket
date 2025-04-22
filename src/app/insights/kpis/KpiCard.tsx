
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { KpiMetric } from "@/types/kpi";

export default function KpiCard({ label, value, trend, changePercent }: KpiMetric) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <p className="text-sm text-muted-foreground">{label}</p>
          {trend && (
            <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}>
              {trend === "up" ? <TrendingUp className="h-4 w-4" /> : 
              trend === "down" ? <TrendingDown className="h-4 w-4" /> : 
              <Minus className="h-4 w-4" />}
              {changePercent && <span className="ml-1 text-xs">{changePercent}%</span>}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold mt-2">{value}</h2>
      </CardContent>
    </Card>
  );
}

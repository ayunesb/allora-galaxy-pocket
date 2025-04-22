
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import type { KpiMetric } from "@/types/kpi";

export default function KpiCard({ label, value, trend, changePercent, historicalData }: KpiMetric) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <p className="text-sm text-muted-foreground">{label}</p>
          {trend && (
            <span className={trend === "up" ? "text-green-500" : "text-red-500"}>
              {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {changePercent !== undefined && (
                <span className="ml-1 text-xs">
                  {changePercent > 0 ? "+" : ""}{changePercent}%
                </span>
              )}
            </span>
          )}
        </div>
        <h2 className="text-2xl font-bold mt-2">{value}</h2>
        
        {historicalData && historicalData.length > 0 && (
          <div className="h-12 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={trend === "up" ? "#22c55e" : "#ef4444"}
                  fill={trend === "up" ? "#22c55e20" : "#ef444420"}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { KPIChart } from "@/components/KPIChart";
import type { KpiMetric } from "@/types/kpi";

interface KpiCardProps extends KpiMetric {
  onUpdate?: () => void;
}

export default function KpiCard({ 
  kpi_name,
  value,
  trend_direction,
  target,
  historicalData,
  onUpdate 
}: KpiCardProps) {
  const animatedValue = useAnimatedNumber(Number(value));

  const trendColor = 
    trend_direction === 'up' ? 'text-green-500' :
    trend_direction === 'down' ? 'text-red-500' : 
    'text-gray-500';

  const chartData = historicalData?.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    value: item.value
  })) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-medium text-sm">{kpi_name}</h3>
        <Badge variant="outline" className={trendColor}>
          {trend_direction === 'up' && <TrendingUp className="h-4 w-4" />}
          {trend_direction === 'down' && <TrendingDown className="h-4 w-4" />}
          {trend_direction === 'neutral' && <Minus className="h-4 w-4" />}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{animatedValue}</div>
        {target && (
          <p className="text-xs text-muted-foreground mt-1">
            Target: {target}
          </p>
        )}
        <div className="mt-4 h-[200px]">
          <KPIChart data={chartData} />
        </div>
      </CardContent>
    </Card>
  );
}


import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { KPIChart } from "@/components/KPIChart";
import type { KpiMetric } from "@/types/kpi";

interface KpiCardProps {
  kpi_name?: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  trend_direction?: 'up' | 'down' | 'neutral';
  target?: number;
  last_value?: number;
  onUpdate?: () => void;
}

export default function KpiCard({ 
  kpi_name,
  value,
  trend,
  trend_direction,
  target,
  onUpdate 
}: KpiCardProps) {
  const animatedValue = useAnimatedNumber(Number(value));
  
  // Use either trend or trend_direction
  const trendValue = trend || trend_direction;

  const trendColor = 
    trendValue === 'up' ? 'text-green-500' :
    trendValue === 'down' ? 'text-red-500' : 
    'text-gray-500';

  // Create placeholder chart data when historicalData is not provided
  const chartData = [
    { date: '1 week ago', value: Number(value) * 0.8 },
    { date: 'Yesterday', value: Number(value) * 0.9 },
    { date: 'Today', value: Number(value) }
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="font-medium text-sm">{kpi_name}</h3>
        <Badge variant="outline" className={trendColor}>
          {trendValue === 'up' && <TrendingUp className="h-4 w-4" />}
          {trendValue === 'down' && <TrendingDown className="h-4 w-4" />}
          {!trendValue && <Minus className="h-4 w-4" />}
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

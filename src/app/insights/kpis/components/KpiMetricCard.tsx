
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiMetricCardProps {
  kpi_name: string;
  value: number;
  target?: number;
  trend_direction?: 'up' | 'down' | 'neutral';
  last_value?: number;
}

export default function KpiMetricCard({
  kpi_name,
  value,
  target,
  trend_direction,
  last_value
}: KpiMetricCardProps) {
  const percentChange = last_value 
    ? ((value - last_value) / last_value) * 100 
    : 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm text-muted-foreground">
            {kpi_name}
          </h3>
          {trend_direction && (
            <div className={trend_direction === 'up' ? 'text-green-500' : 'text-red-500'}>
              {trend_direction === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
        
        <div className="mt-2">
          <span className="text-2xl font-bold">{value.toLocaleString()}</span>
          {target && (
            <span className="text-sm text-muted-foreground ml-2">
              / {target.toLocaleString()}
            </span>
          )}
        </div>

        {last_value && (
          <div className="mt-2 text-sm">
            <span className={percentChange >= 0 ? 'text-green-500' : 'text-red-500'}>
              {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(1)}%
            </span>
            <span className="text-muted-foreground ml-1">vs previous</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

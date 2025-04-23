
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { KpiMetric } from "@/types/kpi";
import { format } from "date-fns";

export default function KpiCard({
  kpi_name, 
  value, 
  target, 
  trend_direction, 
  status,
  updated_at,
  category,
  label,
  trend,
  changePercent
}: KpiMetric) {
  const progressValue = target ? Math.min((value / target) * 100, 100) : 0;
  const displayName = label || kpi_name;
  const trendDir = trend || trend_direction;

  const trendIcon = () => {
    switch(trendDir) {
      case 'up': return <TrendingUp className="text-green-500" />;
      case 'down': return <TrendingDown className="text-red-500" />;
      default: return <Minus className="text-gray-500" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{displayName}</h3>
          {category && (
            <Badge variant="secondary" className="mt-1">
              {category}
            </Badge>
          )}
        </div>
        {trendIcon()}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline mb-2">
          <span className="text-3xl font-bold">{value.toLocaleString()}</span>
          {target && (
            <span className="text-sm text-muted-foreground">
              Target: {target.toLocaleString()}
            </span>
          )}
        </div>
        
        {target && (
          <Progress 
            value={progressValue} 
            className={`mb-2 ${status === 'success' ? 'bg-green-200' : 'bg-red-200'}`} 
          />
        )}

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            Updated: {format(new Date(updated_at), 'MMM dd, yyyy HH:mm')}
          </span>
          {status && (
            <Badge 
              variant={status === 'success' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {status === 'success' ? 'On Target' : 'Behind Target'}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

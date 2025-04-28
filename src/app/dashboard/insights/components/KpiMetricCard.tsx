
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KpiMetricCardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  change: number;
}

export function KpiMetricCard({ title, value, trend, change }: KpiMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : trend === 'down' ? (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            ) : null}
            <span className="text-sm">{change > 0 ? '+' : ''}{change}%</span>
          </div>
        </div>
        <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-gray-500'}`} 
            style={{ width: `${Math.min(Math.abs(change) * 3, 100)}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default KpiMetricCard;

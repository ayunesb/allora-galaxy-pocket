
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useKpiData } from "@/hooks/useKpiData";
import { useMemo } from "react";
import { ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from "@/lib/utils";

interface KPITrackerProps {
  title: string;
  kpiName: string;
  target?: number;
  periodDays?: number;
}

export function KPITracker({ 
  title, 
  kpiName, 
  target = 100,
  periodDays = 7 
}: KPITrackerProps) {
  const { kpiData, isLoading } = useKpiData(kpiName, periodDays);

  const currentValue = useMemo(() => {
    if (!kpiData || !kpiData.current) return 0;
    // Make sure to convert to number
    return typeof kpiData.current === 'string' ? parseFloat(kpiData.current) : kpiData.current;
  }, [kpiData]);

  const percentComplete = Math.min(100, Math.round((currentValue / target) * 100));
  
  const percentChange = useMemo(() => {
    if (!kpiData || !kpiData.previous || kpiData.previous === 0) return 0;
    return ((currentValue - kpiData.previous) / kpiData.previous) * 100;
  }, [kpiData, currentValue]);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="animate-pulse bg-muted h-6 w-16 rounded-md mb-2" />
          <div className="animate-pulse bg-muted h-2 rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-2xl font-bold">{currentValue.toLocaleString()}</div>
        <Progress 
          value={percentComplete} 
          className="h-1 mt-2" 
          indicatorClassName={cn(
            percentComplete < 30 ? "bg-red-500" : 
            percentComplete < 70 ? "bg-yellow-500" : 
            "bg-green-500"
          )}
        />
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center text-sm text-muted-foreground">
          <div className="flex items-center">
            {percentChange > 0 ? (
              <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            ) : percentChange < 0 ? (
              <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            ) : (
              <ArrowRight className="mr-1 h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn(
              percentChange > 0 ? "text-green-500" : 
              percentChange < 0 ? "text-red-500" : 
              ""
            )}>
              {Math.abs(percentChange).toFixed(1)}%
            </span>
          </div>
          <span className="ml-1">vs previous {periodDays}d</span>
        </div>
      </CardFooter>
    </Card>
  );
}

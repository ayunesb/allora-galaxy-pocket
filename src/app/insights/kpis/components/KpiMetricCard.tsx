
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { KpiMetric } from '@/types/kpi';

type KpiMetricCardProps = KpiMetric & {
  onUpdate?: () => void;
};

export function KpiMetricCard({ 
  kpi_name,
  value,
  trend,
  changePercent,
  onUpdate
}: KpiMetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-baseline">
          <h3 className="text-base font-medium text-muted-foreground">{kpi_name}</h3>
          {trend && (
            <div className={`flex items-center ${
              trend === 'up' 
                ? 'text-green-500' 
                : trend === 'down' 
                ? 'text-red-500' 
                : 'text-gray-500'
            }`}>
              {trend === 'up' && <ArrowUp className="h-4 w-4 mr-1" />}
              {trend === 'down' && <ArrowDown className="h-4 w-4 mr-1" />}
              {trend === 'neutral' && <Minus className="h-4 w-4 mr-1" />}
              {changePercent !== undefined && (
                <span className="text-xs font-medium">
                  {Math.abs(typeof changePercent === 'number' ? changePercent : 0).toFixed(1)}%
                </span>
              )}
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-3xl font-bold">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default KpiMetricCard;

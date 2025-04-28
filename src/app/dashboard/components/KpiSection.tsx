
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiMetric } from '@/types/kpi';
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from "lucide-react";

interface KpiSectionProps {
  kpiMetrics: KpiMetric[];
}

export const KpiSection: React.FC<KpiSectionProps> = ({ kpiMetrics = [] }) => {
  return (
    <div className="col-span-3">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>KPI Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {kpiMetrics.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No KPI metrics available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {kpiMetrics.map((metric, index) => (
                <Card key={metric.id || index} className="bg-muted/50">
                  <CardContent className="p-4">
                    <h3 className="font-medium">{metric.kpi_name || metric.metric}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-2xl font-bold">
                        {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
                      </p>
                      {metric.trend && (
                        <div className={`flex items-center ${
                          metric.trend === 'up' 
                            ? 'text-green-600' 
                            : metric.trend === 'down' 
                            ? 'text-red-600' 
                            : 'text-gray-600'
                        }`}>
                          {metric.trend === 'up' && <ArrowUpIcon className="h-4 w-4" />}
                          {metric.trend === 'down' && <ArrowDownIcon className="h-4 w-4" />}
                          {metric.trend === 'neutral' && <ArrowRightIcon className="h-4 w-4" />}
                          {metric.changePercent && (
                            <span className="ml-1 text-sm">
                              {Math.abs(metric.changePercent).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {metric.target && (
                      <div className="text-xs text-muted-foreground mt-2">
                        Target: {metric.target}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KpiSection;

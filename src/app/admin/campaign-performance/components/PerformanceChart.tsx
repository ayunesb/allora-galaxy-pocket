
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  kpiMetrics: any[];
  isLoading: boolean;
}

export function PerformanceChart({ kpiMetrics, isLoading }: PerformanceChartProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>KPI Performance Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : kpiMetrics.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  type="category" 
                  allowDuplicatedCategory={false} 
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {kpiMetrics.map((metric, index) => (
                  <Line 
                    key={metric.name}
                    data={metric.data}
                    type="monotone"
                    dataKey="value"
                    name={metric.name}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
            <p>No KPI metric data available</p>
            <p className="text-sm mt-2">Run campaigns to start collecting metrics</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

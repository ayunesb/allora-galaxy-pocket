
import { useEffect, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface KPIChartProps {
  data: Array<{ date: string; value: number }>;
  title?: string;
  height?: number;
  showXAxis?: boolean;
  showYAxis?: boolean;
  color?: string;
}

export function KPIChart({ 
  data, 
  title, 
  height = 200, 
  showXAxis = true, 
  showYAxis = true, 
  color = "hsl(var(--primary))"
}: KPIChartProps) {
  // Format data for the chart
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    // Sort data by date
    return [...data].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [data]);
  
  // Calculate domain for Y axis
  const yDomain = useMemo(() => {
    if (!data || data.length === 0) return [0, 10];
    
    const values = data.map(point => point.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Add 10% padding
    const padding = (max - min) * 0.1;
    return [min > 0 ? 0 : min - padding, max + padding];
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div 
        className="flex items-center justify-center text-muted-foreground"
        style={{ height: `${height}px` }}
      >
        No data available
      </div>
    );
  }

  return (
    <Card className="p-4">
      {title && <h3 className="text-sm font-medium mb-2">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              strokeWidth={2} 
              dot={false}
              activeDot={{ r: 4 }}
            />
            {showXAxis && (
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }} 
                tickLine={false}
                axisLine={false}
                tickMargin={5}
                minTickGap={20}
              />
            )}
            {showYAxis && (
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={yDomain}
                tickMargin={5}
                width={30}
              />
            )}
            <Tooltip
              formatter={(value: number) => [value.toFixed(1), "Value"]}
              labelFormatter={(label) => `Date: ${label}`}
              contentStyle={{ borderRadius: '6px', border: '1px solid hsl(var(--border))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

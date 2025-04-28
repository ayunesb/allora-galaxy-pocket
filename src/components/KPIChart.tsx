
import React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface KPIChartProps {
  data: Array<{
    date: string | Date;
    value: number;
  }>;
  height?: number;
}

export function KPIChart({ data, height = 300 }: KPIChartProps) {
  const hasData = data && data.length > 0;
  
  if (!hasData) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="date" 
          stroke="#888888" 
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis 
          stroke="#888888" 
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip
          formatter={(value: number) => [`${value}`, 'Value']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#8884d8" 
          fillOpacity={1} 
          fill="url(#colorValue)" 
          isAnimationActive={true}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

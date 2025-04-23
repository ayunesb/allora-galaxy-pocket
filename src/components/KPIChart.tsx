
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface KPIChartProps {
  data: { date: string; value: number }[];
}

export function KPIChart({ data }: KPIChartProps) {
  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-8 text-center">
        <p className="text-muted-foreground mb-2">No chart data available</p>
        <p className="text-xs text-muted-foreground">Metrics will appear here once collected</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#2563eb" 
          strokeWidth={2} 
          dot={false} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

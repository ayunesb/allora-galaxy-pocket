
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

interface PerformanceChartProps {
  chartData: Array<Record<string, any>>;
  allMetricTypes: Set<string>;
}

export function PerformanceChart({ chartData, allMetricTypes }: PerformanceChartProps) {
  if (chartData.length === 0) {
    return (
      <p className="text-center py-6 text-muted-foreground">
        No data available for charting. Add some metrics first.
      </p>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          {Array.from(allMetricTypes).map((metric, index) => (
            <Line 
              key={metric} 
              type="monotone" 
              dataKey={metric} 
              name={metric}
              stroke={`hsl(${index * 30}, 70%, 50%)`}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

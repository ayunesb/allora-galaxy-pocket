
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';

interface MetricDataPoint {
  date: string;
  value: number;
}

interface KpiMetricsDisplayProps {
  metrics: {
    current: number;
    trend: 'up' | 'down' | 'neutral';
    change: number;
    history?: MetricDataPoint[];
  };
}

export function KpiMetricsDisplay({ metrics }: KpiMetricsDisplayProps) {
  if (!metrics.history || metrics.history.length === 0) {
    return (
      <div className="flex justify-center items-center h-[300px] text-muted-foreground">
        No historical data available
      </div>
    );
  }

  // Format the data for the chart
  const chartData = metrics.history.map(point => ({
    date: point.date,
    value: point.value,
    formattedDate: format(parseISO(point.date), 'MMM dd')
  }));

  // Calculate min and max values for Y axis with some padding
  const values = chartData.map(d => d.value);
  const minValue = Math.min(...values) * 0.9;
  const maxValue = Math.max(...values) * 1.1;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="formattedDate" 
          stroke="#6b7280" 
          tick={{ fontSize: 12 }}
        />
        <YAxis 
          domain={[minValue, maxValue]}
          stroke="#6b7280" 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `${value}x`}
        />
        <Tooltip 
          formatter={(value) => [`${value}x`, 'ROI']}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '8px'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="value" 
          name="ROI" 
          stroke="#3b82f6" 
          strokeWidth={2} 
          dot={{ r: 4 }} 
          activeDot={{ r: 8 }} 
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

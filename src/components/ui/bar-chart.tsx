
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface BarChartProps {
  data: any[];
  xAxisKey: string;
  yAxisKey: string;
  categories: string[];
}

export function BarChart({ data, xAxisKey, yAxisKey, categories }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        {categories.map((category, index) => (
          <Bar 
            key={category} 
            dataKey={category} 
            fill={`hsl(${index * 60}, 70%, 50%)`} 
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

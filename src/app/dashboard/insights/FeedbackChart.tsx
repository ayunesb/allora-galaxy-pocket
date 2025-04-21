
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ChartData = {
  name: string;
  used: number;
  dismissed: number;
}

type Props = {
  grouped: {
    [key: string]: {
      used: number;
      dismissed: number;
    }
  }
}

export default function FeedbackChart({ grouped }: Props) {
  const data: ChartData[] = Object.entries(grouped).map(([title, counts]) => ({
    name: title,
    used: counts.used,
    dismissed: counts.dismissed
  }));

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="used" fill="#10b981" name="Used" />
          <Bar dataKey="dismissed" fill="#f59e0b" name="Dismissed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

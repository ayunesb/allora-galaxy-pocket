
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface KpiData {
  metric: string;
  value: number;
  recordedAt: Date;
}

interface KpiTrendsProps {
  metrics: KpiData[];
}

export function KpiTrends({ metrics }: KpiTrendsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPI Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics}>
              <XAxis dataKey="recordedAt" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

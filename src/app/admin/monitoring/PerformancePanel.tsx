
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/ui/bar-chart';

interface PerformanceLog {
  component: string;
  operation: string;
  duration_ms: number;
  success: boolean;
  created_at: string;
}

export function PerformancePanel() {
  const { data: logs } = useQuery({
    queryKey: ['performance-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('performance_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PerformanceLog[];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const chartData = logs?.reduce((acc, log) => {
    const component = log.component;
    if (!acc[component]) {
      acc[component] = {
        avgDuration: 0,
        count: 0,
        errorRate: 0
      };
    }
    
    acc[component].avgDuration += log.duration_ms;
    acc[component].count += 1;
    if (!log.success) acc[component].errorRate += 1;
    
    return acc;
  }, {} as Record<string, { avgDuration: number; count: number; errorRate: number }>);

  const processedData = Object.entries(chartData || {}).map(([component, stats]) => ({
    name: component,
    avgDuration: Math.round(stats.avgDuration / stats.count),
    errorRate: Math.round((stats.errorRate / stats.count) * 100)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <BarChart 
            data={processedData}
            xAxisKey="name"
            yAxisKey="avgDuration"
            categories={['avgDuration']}
          />
        </div>
      </CardContent>
    </Card>
  );
}

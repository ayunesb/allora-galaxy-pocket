
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemMetric {
  id: string;
  metric_name: string;
  value: number;
  recorded_at: string;
  metadata?: any;
}

export function SystemMetricsPanel() {
  const [timeframe, setTimeframe] = useState('week');
  
  const { data: metrics = [], isLoading, refetch } = useQuery({
    queryKey: ['system-metrics', timeframe],
    queryFn: async () => {
      // Get timestamp for start of period based on timeframe
      const now = new Date();
      let startDate;
      
      if (timeframe === 'day') {
        startDate = new Date(now.setHours(now.getHours() - 24));
      } else if (timeframe === 'week') {
        startDate = new Date(now.setDate(now.getDate() - 7));
      } else {
        startDate = new Date(now.setMonth(now.getMonth() - 1));
      }
      
      const { data, error } = await supabase
        .from('system_metrics')
        .select('*')
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      
      // Group metrics by name for charting
      const metricsData = data || [];
      return processMetricsData(metricsData);
    }
  });
  
  // Process metrics data for visualization
  const processMetricsData = (rawMetrics: SystemMetric[]) => {
    // Group by metric name
    const metricGroups: Record<string, any[]> = {};
    
    rawMetrics.forEach(metric => {
      if (!metricGroups[metric.metric_name]) {
        metricGroups[metric.metric_name] = [];
      }
      
      metricGroups[metric.metric_name].push({
        timestamp: new Date(metric.recorded_at).toLocaleDateString(),
        value: metric.value,
        raw_date: new Date(metric.recorded_at)
      });
    });
    
    return Object.keys(metricGroups).map(name => ({
      name,
      data: metricGroups[name]
    }));
  };
  
  const exportMetrics = () => {
    try {
      if (!metrics.length) {
        toast.error('No metrics data to export');
        return;
      }
      
      // Flatten metrics data for CSV
      const flatData = metrics.flatMap(metric => 
        metric.data.map(point => ({
          metric_name: metric.name,
          value: point.value,
          timestamp: point.timestamp,
          raw_date: point.raw_date
        }))
      );
      
      // Sort by date
      flatData.sort((a, b) => a.raw_date - b.raw_date);
      
      // Create CSV content
      const headers = ['Metric', 'Value', 'Date'];
      const csvContent = [
        headers.join(','),
        ...flatData.map(row => 
          [row.metric_name, row.value, row.timestamp].join(',')
        )
      ].join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system-metrics-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      URL.revokeObjectURL(url);
      toast.success('Metrics data exported successfully');
      
    } catch (err) {
      console.error('Error exporting metrics:', err);
      toast.error('Failed to export metrics');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>System Metrics</CardTitle>
          <CardDescription>Performance and health metrics with predictive trends</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportMetrics}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="week" value={timeframe} onValueChange={setTimeframe}>
          <TabsList className="mb-4">
            <TabsTrigger value="day">Last 24 Hours</TabsTrigger>
            <TabsTrigger value="week">Last Week</TabsTrigger>
            <TabsTrigger value="month">Last Month</TabsTrigger>
          </TabsList>
          
          <TabsContent value={timeframe} className="space-y-4">
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : metrics.length > 0 ? (
              <div className="space-y-8">
                {metrics.map(metricGroup => (
                  <div key={metricGroup.name} className="space-y-2">
                    <h3 className="font-medium text-sm">{metricGroup.name}</h3>
                    <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metricGroup.data}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis 
                            dataKey="timestamp" 
                            tick={{ fontSize: 12 }} 
                            tickFormatter={(date) => {
                              // Abbreviate date format for better display
                              if (timeframe === 'day') {
                                return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              }
                              return date;
                            }}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <defs>
                            <linearGradient id={`gradient-${metricGroup.name}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8884d8" 
                            fillOpacity={1} 
                            fill={`url(#gradient-${metricGroup.name})`} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <PredictiveInsight metricName={metricGroup.name} data={metricGroup.data} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No metrics data available for this timeframe</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Component to show predictive insights based on metric trends
function PredictiveInsight({ metricName, data }) {
  // Simple linear regression to predict trend
  const calculateTrend = () => {
    if (!data || data.length < 3) return { trend: 'neutral', description: 'Not enough data points for prediction' };
    
    // Get last 5 points or all if less than 5
    const recentPoints = data.slice(-5);
    
    // Calculate the average of the first half and second half
    const midpoint = Math.floor(recentPoints.length / 2);
    const firstHalf = recentPoints.slice(0, midpoint);
    const secondHalf = recentPoints.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((sum, point) => sum + point.value, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, point) => sum + point.value, 0) / secondHalf.length;
    
    // Determine trend direction and magnitude
    const diff = secondAvg - firstAvg;
    const percentChange = (diff / firstAvg) * 100;
    
    if (Math.abs(percentChange) < 2) {
      return { trend: 'neutral', description: 'Metrics are stable with minimal fluctuation' };
    } else if (percentChange > 0) {
      return { 
        trend: 'increasing', 
        description: `Metrics trending upward at ${percentChange.toFixed(1)}% growth rate`,
        prediction: 'Expected to continue increasing based on current trend'
      };
    } else {
      return {
        trend: 'decreasing',
        description: `Metrics trending downward at ${Math.abs(percentChange).toFixed(1)}% decline rate`,
        prediction: 'Expected to continue decreasing based on current trend'
      };
    }
  };
  
  const insight = calculateTrend();
  
  return (
    <div className="mt-2 text-xs">
      <div className={`p-2 rounded-sm ${
        insight.trend === 'increasing' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 
        insight.trend === 'decreasing' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 
        'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
      }`}>
        <p className="font-medium">Trend: {insight.description}</p>
        {insight.prediction && (
          <p className="mt-1">Prediction: {insight.prediction}</p>
        )}
      </div>
    </div>
  );
}

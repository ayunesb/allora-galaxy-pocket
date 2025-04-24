
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrategySystem } from '@/hooks/useStrategySystem';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, PlusCircle, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

interface StrategyPerformanceTrackerProps {
  strategyId: string;
  initialMetrics?: Record<string, number>;
}

export function StrategyPerformanceTracker({ strategyId, initialMetrics = {} }: StrategyPerformanceTrackerProps) {
  const [metrics, setMetrics] = useState<Record<string, number>>(initialMetrics);
  const [newMetricName, setNewMetricName] = useState('');
  const [newMetricValue, setNewMetricValue] = useState('');
  const { trackStrategyPerformance, isLoading } = useStrategySystem();
  const { tenant } = useTenant();
  
  // Fetch historical metrics for this strategy
  const { data: historicalMetrics, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['strategy-metrics-history', strategyId],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .filter('metadata->strategy_id', 'eq', strategyId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      // Group metrics by date for chart visualization
      const metricsByDate: Record<string, Record<string, number>> = {};
      
      data.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString();
        if (!metricsByDate[date]) metricsByDate[date] = {};
        metricsByDate[date][item.metric] = Number(item.value);
      });
      
      // Convert to array format for chart
      return Object.entries(metricsByDate).map(([date, values]) => ({
        date,
        ...values
      }));
    },
    enabled: !!tenant?.id && !!strategyId
  });

  const addMetric = () => {
    if (!newMetricName.trim() || !newMetricValue.trim()) return;
    
    try {
      const value = parseFloat(newMetricValue);
      if (isNaN(value)) throw new Error("Value must be a number");
      
      setMetrics({
        ...metrics,
        [newMetricName]: value
      });
      
      setNewMetricName('');
      setNewMetricValue('');
    } catch (error) {
      console.error("Invalid value:", error);
    }
  };

  const removeMetric = (key: string) => {
    const updatedMetrics = { ...metrics };
    delete updatedMetrics[key];
    setMetrics(updatedMetrics);
  };

  const handleSaveMetrics = async () => {
    await trackStrategyPerformance(strategyId, metrics);
  };

  const metricKeys = Object.keys(metrics || {});
  const chartData = historicalMetrics || [];
  const allMetricTypes = new Set<string>();
  
  chartData.forEach(dataPoint => {
    Object.keys(dataPoint).forEach(key => {
      if (key !== 'date') allMetricTypes.add(key);
    });
  });
  
  // Add current metrics to the set
  Object.keys(metrics).forEach(key => allMetricTypes.add(key));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Performance</CardTitle>
        <CardDescription>
          Track and measure key performance indicators for this strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Metrics</TabsTrigger>
            <TabsTrigger value="history">Metrics History</TabsTrigger>
            <TabsTrigger value="chart">Performance Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="current">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {metricKeys.length > 0 ? (
                  metricKeys.map(key => (
                    <div key={key} className="border rounded-md p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{key}</div>
                        <div className="text-2xl">{metrics[key]}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeMetric(key)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2 text-center py-4">
                    No metrics added yet. Add your first metric below.
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <div className="flex-1">
                  <Label htmlFor="metric-name">Metric Name</Label>
                  <Input
                    id="metric-name"
                    placeholder="e.g., Conversions"
                    value={newMetricName}
                    onChange={(e) => setNewMetricName(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="metric-value">Value</Label>
                  <Input
                    id="metric-value"
                    placeholder="e.g., 1250"
                    value={newMetricValue}
                    onChange={(e) => setNewMetricValue(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addMetric}
                    disabled={!newMetricName || !newMetricValue}
                    className="mb-0"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : chartData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      {Array.from(allMetricTypes).map(metric => (
                        <th key={metric} className="text-left p-2">{metric}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {chartData.map((entry, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{entry.date}</td>
                        {Array.from(allMetricTypes).map(metric => (
                          <td key={metric} className="p-2">
                            {entry[metric] !== undefined ? entry[metric] : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                No historical data available
              </p>
            )}
          </TabsContent>
          
          <TabsContent value="chart">
            {chartData.length > 0 ? (
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
            ) : (
              <p className="text-center py-6 text-muted-foreground">
                No data available for charting. Add some metrics first.
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSaveMetrics}
          disabled={Object.keys(metrics).length === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Metrics
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

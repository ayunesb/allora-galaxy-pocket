
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStrategySystem } from '@/hooks/useStrategySystem';
import { Loader2, Save } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { CurrentMetricsForm } from './CurrentMetricsForm';
import { HistoricalMetricsTable } from './HistoricalMetricsTable';
import { PerformanceChart } from './PerformanceChart';

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
      
      const metricsByDate: Record<string, Record<string, number>> = {};
      
      data.forEach(item => {
        const date = new Date(item.created_at).toLocaleDateString();
        if (!metricsByDate[date]) metricsByDate[date] = {};
        metricsByDate[date][item.metric] = Number(item.value);
      });
      
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

  const chartData = historicalMetrics || [];
  const allMetricTypes = new Set<string>();
  
  chartData.forEach(dataPoint => {
    Object.keys(dataPoint).forEach(key => {
      if (key !== 'date') allMetricTypes.add(key);
    });
  });
  
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
            <CurrentMetricsForm 
              metrics={metrics}
              newMetricName={newMetricName}
              newMetricValue={newMetricValue}
              setNewMetricName={setNewMetricName}
              setNewMetricValue={setNewMetricValue}
              addMetric={addMetric}
              removeMetric={removeMetric}
            />
          </TabsContent>
          
          <TabsContent value="history">
            <HistoricalMetricsTable 
              isLoading={isLoadingHistory}
              chartData={chartData}
              allMetricTypes={allMetricTypes}
            />
          </TabsContent>
          
          <TabsContent value="chart">
            <PerformanceChart 
              chartData={chartData}
              allMetricTypes={allMetricTypes}
            />
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

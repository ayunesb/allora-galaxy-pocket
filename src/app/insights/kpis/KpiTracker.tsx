
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { format, subDays } from "date-fns";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Calendar, Download, Filter } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";
import { useExportCSV } from "@/hooks/useExportCSV";

interface KpiMetric {
  id: string;
  tenant_id: string;
  metric: string;
  value: number;
  target?: number;
  updated_at: string;
  recorded_at: string;
  previous_value?: number;
  trend?: 'up' | 'down' | 'neutral';
  change_percent?: number;
}

interface ChartData {
  date: string;
  value: number;
}

export function KpiTracker() {
  const { tenant } = useTenant();
  const [dateRange, setDateRange] = useState<string>("7"); // Default to 7 days
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { downloadCSV } = useExportCSV();
  
  // Date calculations for filtering
  const endDate = new Date();
  const startDate = subDays(endDate, parseInt(dateRange));
  
  const { data: kpiData, isLoading, error } = useQuery({
    queryKey: ['kpi-metrics', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      // Fetch current KPI data
      const { data: currentData, error: currentError } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('recorded_at', { ascending: false });
        
      if (currentError) throw currentError;
      
      // Fetch historical data for comparison and trends from kpi_metrics_history
      const { data: historyData, error: historyError } = await supabase
        .from('kpi_metrics_history')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('recorded_at', format(startDate, 'yyyy-MM-dd'));
        
      if (historyError) throw historyError;
      
      // Group by metric name to find latest values and calculate trends
      const metricGroups: Record<string, any[]> = {};
      const results: KpiMetric[] = [];
      
      // Process current metrics first
      if (currentData) {
        for (const item of currentData) {
          if (!metricGroups[item.metric]) {
            metricGroups[item.metric] = [];
          }
          metricGroups[item.metric].push(item);
        }
      }
      
      // Add historical data to the same groups
      if (historyData) {
        for (const item of historyData) {
          if (!metricGroups[item.metric]) {
            metricGroups[item.metric] = [];
          }
          metricGroups[item.metric].push(item);
        }
      }
      
      // Process each metric group to calculate trends and collect results
      Object.entries(metricGroups).forEach(([metric, values]) => {
        // Sort by recorded_at descending to get latest first
        const sortedValues = values.sort((a, b) => 
          new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
        );
        
        if (sortedValues.length === 0) return;
        
        const latestValue = sortedValues[0];
        const previousValue = sortedValues.length > 1 ? sortedValues[1] : null;
        
        const result: KpiMetric = {
          ...latestValue,
          previous_value: previousValue?.value,
          trend: previousValue 
            ? latestValue.value > previousValue.value 
              ? 'up' 
              : latestValue.value < previousValue.value 
                ? 'down' 
                : 'neutral'
            : undefined,
          change_percent: previousValue && previousValue.value !== 0
            ? parseFloat((((latestValue.value - previousValue.value) / previousValue.value) * 100).toFixed(1))
            : undefined
        };
        
        results.push(result);
      });
      
      return results;
    },
    enabled: !!tenant?.id,
  });
  
  // Historical chart data query
  const { data: chartData } = useQuery({
    queryKey: ['kpi-history', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return {};
      
      const { data, error } = await supabase
        .from('kpi_metrics_history')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('recorded_at', format(startDate, 'yyyy-MM-dd'))
        .order('recorded_at', { ascending: true });
        
      if (error) throw error;
      
      // Group by metric for chart data
      const metricCharts: Record<string, ChartData[]> = {};
      
      if (data) {
        data.forEach(item => {
          if (!metricCharts[item.metric]) {
            metricCharts[item.metric] = [];
          }
          
          metricCharts[item.metric].push({
            date: format(new Date(item.recorded_at), 'MM/dd'),
            value: Number(item.value)
          });
        });
      }
      
      return metricCharts;
    },
    enabled: !!tenant?.id,
  });
  
  // Handle exporting KPI data to CSV
  const handleExportCSV = async () => {
    if (!kpiData?.length) {
      toast({
        title: "No data to export",
        description: "There are no KPI metrics available to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await downloadCSV('kpis', { dateRange: parseInt(dateRange) });
      toast({
        title: "Export successful",
        description: "KPI data has been exported to CSV."
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Could not export KPI data. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Handle refreshing data
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['kpi-metrics'] });
    queryClient.invalidateQueries({ queryKey: ['kpi-history'] });
    toast({
      title: "Data refreshed",
      description: "KPI metrics have been refreshed."
    });
  };
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="text-red-500 font-semibold mb-4">
          Error loading KPI data: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">KPI Tracker</h1>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center">
            <Select 
              value={dateRange} 
              onValueChange={setDateRange}
            >
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <Loader2 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={handleExportCSV} size="sm" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : kpiData && kpiData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiData.map((kpi) => (
            <KpiCard 
              key={kpi.id} 
              kpi={kpi} 
              chartData={chartData?.[kpi.metric] || []} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-2">No KPI metrics available</h3>
          <p className="text-muted-foreground mb-4">
            You haven't added any KPI metrics yet.
          </p>
          <Button variant="outline">Add Your First KPI</Button>
        </div>
      )}
    </div>
  );
}

interface KpiCardProps {
  kpi: KpiMetric;
  chartData: ChartData[];
}

function KpiCard({ kpi, chartData }: KpiCardProps) {
  const [showChart, setShowChart] = useState(false);
  
  const trendColor = useMemo(() => {
    if (kpi.trend === 'up') return 'text-green-500';
    if (kpi.trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  }, [kpi.trend]);
  
  const targetStatus = useMemo(() => {
    if (!kpi.target) return null;
    return kpi.value >= kpi.target ? 'above' : 'below';  
  }, [kpi.value, kpi.target]);
  
  return (
    <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{kpi.metric}</CardTitle>
          {kpi.trend && (
            <div className={`flex items-center ${trendColor}`}>
              {kpi.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : kpi.trend === 'down' ? (
                <TrendingDown className="h-4 w-4 mr-1" />
              ) : null}
              {kpi.change_percent !== undefined && (
                <span className="text-sm font-medium">
                  {kpi.change_percent > 0 ? '+' : ''}{kpi.change_percent}%
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-baseline mb-2">
          <div className="text-3xl font-bold">{kpi.value.toLocaleString()}</div>
          {kpi.target && (
            <div className="ml-2 text-sm text-muted-foreground">
              Target: {kpi.target.toLocaleString()}
            </div>
          )}
        </div>
        
        {targetStatus && (
          <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            targetStatus === 'above' ? 
            'bg-green-100 text-green-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {targetStatus === 'above' ? 'Above target' : 'Below target'}
          </div>
        )}
        
        <div className="mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 h-auto text-xs text-blue-600"
            onClick={() => setShowChart(!showChart)}
          >
            {showChart ? 'Hide chart' : 'Show chart'}
          </Button>
        </div>
        
        {showChart && chartData.length > 1 && (
          <div className="h-40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }} 
                  tickMargin={5}
                />
                <YAxis 
                  tick={{ fontSize: 10 }} 
                  width={30}
                />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  dot={{ r: 2 }}
                  strokeWidth={2} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {showChart && chartData.length <= 1 && (
          <div className="h-20 mt-4 flex items-center justify-center text-sm text-muted-foreground">
            Not enough data for chart visualization
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground pt-0">
        Last updated: {format(new Date(kpi.updated_at || kpi.recorded_at), 'MMM d, yyyy h:mma')}
      </CardFooter>
    </Card>
  );
}

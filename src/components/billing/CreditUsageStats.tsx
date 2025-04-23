
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useQuery } from "@tanstack/react-query";
import { BarChart, PieChart, DoughnutChart } from "@/components/ui/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Define types for credit usage data
interface CreditUsageByModule {
  module: string;
  credits_used: number;
}

interface CreditUsageByAgent {
  agent_name: string;
  credits_used: number;
}

interface CreditUsageByDay {
  day: string;
  credits_used: number;
}

export function CreditUsageStats() {
  const { tenant } = useTenant();
  const [period, setPeriod] = React.useState<'7days' | '30days' | '90days'>('30days');
  
  // Calculate date range based on period
  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === '7days') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30days') {
      startDate.setDate(startDate.getDate() - 30);
    } else {
      startDate.setDate(startDate.getDate() - 90);
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  };
  
  // Fetch credit usage data by module
  const { data: moduleData, isLoading: moduleLoading, error: moduleError } = useQuery({
    queryKey: ['credit-usage-by-module', tenant?.id, period],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { startDate, endDate } = getDateRange();
      
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('module, credits_used')
        .eq('tenant_id', tenant.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      
      // Aggregate data by module
      const moduleAggregation = data.reduce((acc: Record<string, number>, curr) => {
        if (!acc[curr.module]) acc[curr.module] = 0;
        acc[curr.module] += curr.credits_used;
        return acc;
      }, {});
      
      // Convert to array for chart
      return Object.entries(moduleAggregation).map(([module, credits_used]) => ({
        module,
        credits_used
      }));
    },
    enabled: !!tenant?.id
  });
  
  // Fetch credit usage data by agent
  const { data: agentData, isLoading: agentLoading, error: agentError } = useQuery({
    queryKey: ['credit-usage-by-agent', tenant?.id, period],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { startDate, endDate } = getDateRange();
      
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('agent_name, credits_used')
        .eq('tenant_id', tenant.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      
      // Aggregate data by agent
      const agentAggregation = data.reduce((acc: Record<string, number>, curr) => {
        if (!acc[curr.agent_name]) acc[curr.agent_name] = 0;
        acc[curr.agent_name] += curr.credits_used;
        return acc;
      }, {});
      
      // Convert to array for chart
      return Object.entries(agentAggregation).map(([agent_name, credits_used]) => ({
        agent_name,
        credits_used
      }));
    },
    enabled: !!tenant?.id
  });
  
  // Fetch credit usage data by day
  const { data: dailyData, isLoading: dailyLoading, error: dailyError } = useQuery({
    queryKey: ['credit-usage-by-day', tenant?.id, period],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { startDate, endDate } = getDateRange();
      
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('created_at, credits_used')
        .eq('tenant_id', tenant.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      if (error) throw error;
      
      // Group by day
      const dailyUsage = data.reduce((acc: Record<string, number>, curr) => {
        const day = new Date(curr.created_at).toISOString().split('T')[0];
        if (!acc[day]) acc[day] = 0;
        acc[day] += curr.credits_used;
        return acc;
      }, {});
      
      // Generate complete date range with zeros for missing days
      const dateRange = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const day = d.toISOString().split('T')[0];
        dateRange.push({
          day,
          credits_used: dailyUsage[day] || 0
        });
      }
      
      return dateRange;
    },
    enabled: !!tenant?.id
  });
  
  // Handle errors
  if (moduleError || agentError || dailyError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load credit usage data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Format data for charts
  const moduleChartData = moduleData?.map(item => ({
    name: item.module,
    value: item.credits_used
  })) || [];
  
  const agentChartData = agentData?.map(item => ({
    name: item.agent_name,
    value: item.credits_used
  })) || [];
  
  const dailyChartData = {
    labels: dailyData?.map(item => {
      const date = new Date(item.day);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'Credits Used',
        data: dailyData?.map(item => item.credits_used) || [],
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }
    ]
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <CardTitle>Credit Usage</CardTitle>
        <Tabs
          value={period}
          onValueChange={(v) => setPeriod(v as '7days' | '30days' | '90days')}
          className="mt-2 sm:mt-0"
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-[300px]">
            <TabsTrigger value="7days">7 Days</TabsTrigger>
            <TabsTrigger value="30days">30 Days</TabsTrigger>
            <TabsTrigger value="90days">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Daily Usage Chart */}
          <div className="md:col-span-2 lg:col-span-3">
            <h3 className="mb-3 font-semibold">Daily Credit Usage</h3>
            {dailyLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <BarChart data={dailyChartData} />
              </div>
            )}
          </div>
          
          {/* Usage by Module */}
          <div>
            <h3 className="mb-3 font-semibold">Usage by Feature</h3>
            {moduleLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : moduleChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] border rounded-md">
                <p className="text-muted-foreground">No data available</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <DoughnutChart data={moduleChartData} />
              </div>
            )}
          </div>
          
          {/* Usage by Agent */}
          <div>
            <h3 className="mb-3 font-semibold">Usage by Agent</h3>
            {agentLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : agentChartData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] border rounded-md">
                <p className="text-muted-foreground">No data available</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <PieChart data={agentChartData} />
              </div>
            )}
          </div>
          
          {/* Stats Summary */}
          <div>
            <h3 className="mb-3 font-semibold">Usage Summary</h3>
            {moduleLoading || agentLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="space-y-4 p-4 border rounded-md h-[300px] overflow-y-auto">
                <div>
                  <p className="text-sm font-medium">Total Credits Used</p>
                  <p className="text-2xl font-bold">{moduleChartData.reduce((sum, item) => sum + item.value, 0)}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Top Feature</p>
                  <p className="text-lg font-semibold">
                    {moduleChartData.length > 0 
                      ? moduleChartData.sort((a, b) => b.value - a.value)[0].name 
                      : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Top Agent</p>
                  <p className="text-lg font-semibold">
                    {agentChartData.length > 0 
                      ? agentChartData.sort((a, b) => b.value - a.value)[0].name 
                      : 'N/A'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Peak Usage Day</p>
                  <p className="text-lg font-semibold">
                    {dailyData && dailyData.length > 0 
                      ? (() => {
                          const peak = dailyData.reduce((max, day) => day.credits_used > max.credits_used ? day : max, dailyData[0]);
                          return new Date(peak.day).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          });
                        })()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

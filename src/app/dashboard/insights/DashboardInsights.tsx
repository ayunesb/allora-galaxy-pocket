import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Loader2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays } from "date-fns";
import { MetricsOverview } from "./components/MetricsOverview";
import { FeedbackAnalytics } from "./components/FeedbackAnalytics";
import { CampaignsList } from "./components/CampaignsList";
import { PluginUsageList } from "./components/PluginUsageList";

export default function DashboardInsights() {
  const { tenant } = useTenant();
  const [dateRange, setDateRange] = useState("30");
  const [campaignType, setCampaignType] = useState("all");

  // Calculate date range
  const startDate = subDays(new Date(), parseInt(dateRange));
  const formattedStartDate = format(startDate, "yyyy-MM-dd");

  // Fetch KPI metrics
  const { data: kpiData, isLoading: isLoadingKpi } = useQuery({
    queryKey: ['kpi-metrics-insights', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Fetch strategy feedback data
  const { data: feedbackData, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['strategy-feedback', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('strategy_feedback')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Fetch plugin usage logs
  const { data: pluginData, isLoading: isLoadingPlugins } = useQuery({
    queryKey: ['plugin-usage', tenant?.id, dateRange],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('plugin_usage_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Fetch top campaigns
  const { data: topCampaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['top-campaigns', tenant?.id, dateRange, campaignType],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', formattedStartDate)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (campaignType !== "all") {
        // In a real app, we would filter by campaign type here
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  // Process feedback data for the chart
  const processFeedbackData = () => {
    if (!feedbackData) return { used: 0, dismissed: 0 };
    
    const used = feedbackData.filter(item => item.action === 'used').length;
    const dismissed = feedbackData.filter(item => item.action === 'dismissed').length;
    
    return { used, dismissed };
  };

  const feedbackStats = processFeedbackData();
  const isLoading = isLoadingKpi || isLoadingFeedback || isLoadingPlugins || isLoadingCampaigns;

  // Process plugin data
  const processPluginData = () => {
    if (!pluginData) return {};
    
    return pluginData.reduce((acc: Record<string, number>, item: any) => {
      acc[item.plugin_key] = (acc[item.plugin_key] || 0) + 1;
      return acc;
    }, {});
  };

  const pluginStats = processPluginData();

  const grouped: Record<string, {used: number, dismissed: number}> = 
    feedbackData?.reduce((acc, curr: any) => {
      if (!acc[curr.strategy_title]) {
        acc[curr.strategy_title] = { used: 0, dismissed: 0 };
      }
      if (curr.action === 'used' || curr.action === 'dismissed') {
        acc[curr.strategy_title][curr.action]++;
      }
      return acc;
    }, {} as Record<string, {used: number, dismissed: number}>) || {};

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard Insights</h1>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MetricsOverview
        feedbackStats={feedbackStats}
        pluginStats={pluginStats}
        kpiData={kpiData}
      />

      <Tabs defaultValue="feedback">
        <TabsList className="mb-4">
          <TabsTrigger value="feedback">Strategy Feedback</TabsTrigger>
          <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
          <TabsTrigger value="plugins">Plugin Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback">
          <FeedbackAnalytics grouped={grouped} />
        </TabsContent>
        
        <TabsContent value="campaigns">
          <CampaignsList campaigns={topCampaigns || []} />
        </TabsContent>
        
        <TabsContent value="plugins">
          <PluginUsageList pluginStats={pluginStats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

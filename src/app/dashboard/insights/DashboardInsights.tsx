
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Loader2, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FeedbackChart from "./FeedbackChart";
import { format, subDays } from "date-fns";

// Type for campaigns from the database
type Campaign = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: string | null;
};

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

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Strategy Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {feedbackStats.used + feedbackStats.dismissed > 0 
                ? Math.round((feedbackStats.used / (feedbackStats.used + feedbackStats.dismissed)) * 100)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">
              {feedbackStats.used} approved, {feedbackStats.dismissed} declined
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Active Plugins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Object.keys(pluginStats).length}
            </div>
            <p className="text-sm text-muted-foreground">
              {Object.entries(pluginStats).map(([key, value], index, arr) => (
                <span key={key}>{key}{index < arr.length - 1 ? ', ' : ''}</span>
              ))}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md">ROI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {kpiData?.find(m => m.metric.toLowerCase() === 'roi')?.value || '0'}x
            </div>
            <p className="text-sm text-muted-foreground">
              Based on current campaign performance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback">
        <TabsList className="mb-4">
          <TabsTrigger value="feedback">Strategy Feedback</TabsTrigger>
          <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
          <TabsTrigger value="plugins">Plugin Usage</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Strategy Feedback Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(grouped).length > 0 ? (
                <div className="h-[400px]">
                  <FeedbackChart grouped={grouped} />
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No feedback data available for the selected period.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Top 5 Performing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {topCampaigns && topCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {topCampaigns.map((campaign: Campaign) => (
                    <div key={campaign.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.description || "No description"}</p>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No campaigns found for the selected period.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="plugins">
          <Card>
            <CardHeader>
              <CardTitle>Plugin Usage</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(pluginStats).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(pluginStats).map(([plugin, count]) => (
                    <div key={plugin} className="flex justify-between items-center border-b pb-2">
                      <div className="capitalize">{String(plugin).replace('_', ' ')}</div>
                      <div className="font-medium">{count} uses</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No plugin usage data available for the selected period.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

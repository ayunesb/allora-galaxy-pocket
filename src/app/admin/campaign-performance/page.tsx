
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { Loader2, ArrowRight, RefreshCw } from "lucide-react";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { useKpiAlerts } from "@/hooks/useKpiAlerts";

export default function CampaignPerformancePage() {
  const queryClient = React.useQueryClient();
  const { trackCampaignOutcome, captureCampaignFeedback } = useCampaignIntegration();
  const { triggerKpiCheck } = useKpiAlerts();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  
  // Get campaigns with their related KPI insights
  const { data: campaignPerformance = [], isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaign-performance-data'],
    queryFn: async () => {
      // First get campaigns
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (campaignError) throw campaignError;
      
      // Then get KPI insights for each campaign
      const campaignsWithInsights = await Promise.all(campaigns.map(async (campaign) => {
        const { data: insights, error: insightError } = await supabase
          .from('kpi_insights')
          .select('*')
          .eq('campaign_id', campaign.id);
        
        if (insightError) {
          console.error("Error fetching insights:", insightError);
          return { ...campaign, insights: [] };
        }
        
        return { ...campaign, insights: insights || [] };
      }));
      
      return campaignsWithInsights;
    }
  });
  
  // Get KPI metrics for the performance charts
  const { data: kpiMetrics = [], isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['campaign-kpi-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_metrics')
        .select('*')
        .order('recorded_at', { ascending: true });
      
      if (error) throw error;
      
      // Group by metric and prepare for charts
      const metricsByName: Record<string, any[]> = {};
      data.forEach(metric => {
        if (!metricsByName[metric.metric]) {
          metricsByName[metric.metric] = [];
        }
        
        metricsByName[metric.metric].push({
          date: format(new Date(metric.recorded_at), 'MM/dd'),
          value: metric.value
        });
      });
      
      return Object.entries(metricsByName).map(([name, values]) => ({
        name,
        data: values
      }));
    }
  });
  
  const refreshData = async () => {
    setIsRefreshing(true);
    
    try {
      // Trigger KPI alert check to update insights
      await triggerKpiCheck();
      
      // Refresh campaign data
      await queryClient.invalidateQueries({ queryKey: ['campaign-performance-data'] });
      await queryClient.invalidateQueries({ queryKey: ['campaign-kpi-metrics'] });
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handleTrackCampaign = async (campaignId: string) => {
    try {
      trackCampaignOutcome(campaignId);
      toast.success("Campaign tracking initiated", {
        description: "KPI insights will be updated shortly"
      });
    } catch (error) {
      console.error("Error tracking campaign:", error);
    }
  };
  
  const isLoading = isLoadingCampaigns || isLoadingMetrics || isRefreshing;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campaign Performance</h1>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {campaignPerformance?.filter(c => c.status === 'active')?.length || 0}
            </div>
            <p className="text-muted-foreground">Campaigns currently running</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">KPI Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {(() => {
                    let success = 0;
                    let total = 0;
                    
                    campaignPerformance?.forEach(campaign => {
                      campaign.insights?.forEach((insight: any) => {
                        if (insight.outcome) {
                          total++;
                          if (insight.outcome === 'success') {
                            success++;
                          }
                        }
                      });
                    });
                    
                    if (total === 0) return "N/A";
                    return `${Math.round((success / total) * 100)}%`;
                  })()}
                </div>
                <p className="text-muted-foreground">KPIs meeting targets</p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Impact</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-10">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">
                  {(() => {
                    const insightCounts = campaignPerformance?.flatMap(c => c.insights || []).length;
                    if (insightCounts === 0) return "N/A";
                    return "Medium";
                  })()}
                </div>
                <p className="text-muted-foreground">Average campaign impact level</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>KPI Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingMetrics ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : kpiMetrics.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    type="category" 
                    allowDuplicatedCategory={false} 
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {kpiMetrics.map((metric, index) => (
                    <Line 
                      key={metric.name}
                      data={metric.data}
                      type="monotone"
                      dataKey="value"
                      name={metric.name}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
              <p>No KPI metric data available</p>
              <p className="text-sm mt-2">Run campaigns to start collecting metrics</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Detail</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : campaignPerformance.length > 0 ? (
            <Tabs defaultValue="active">
              <TabsList className="mb-4">
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active">
                {campaignPerformance
                  .filter(campaign => campaign.status === 'active')
                  .map((campaign, index) => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      onTrack={() => handleTrackCampaign(campaign.id)}
                    />
                  ))}
                
                {campaignPerformance.filter(c => c.status === 'active').length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    No active campaigns found
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="completed">
                {campaignPerformance
                  .filter(campaign => campaign.status === 'completed')
                  .map((campaign, index) => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      onTrack={() => handleTrackCampaign(campaign.id)}
                    />
                  ))}
                
                {campaignPerformance.filter(c => c.status === 'completed').length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    No completed campaigns found
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="draft">
                {campaignPerformance
                  .filter(campaign => campaign.status === 'draft')
                  .map((campaign, index) => (
                    <CampaignCard 
                      key={campaign.id} 
                      campaign={campaign} 
                      onTrack={() => handleTrackCampaign(campaign.id)}
                    />
                  ))}
                
                {campaignPerformance.filter(c => c.status === 'draft').length === 0 && (
                  <div className="text-center p-8 text-muted-foreground">
                    No draft campaigns found
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center p-8 text-muted-foreground">
              No campaigns found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CampaignCard({ campaign, onTrack }: { campaign: any, onTrack: () => void }) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{campaign.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant={campaign.status === 'active' ? "default" : 
                          campaign.status === 'completed' ? "success" : 
                          "secondary"}>
              {campaign.status}
            </Badge>
            <Badge variant="outline">
              {format(new Date(campaign.created_at), 'MMM d, yyyy')}
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-shrink-0"
          onClick={onTrack}
        >
          Track Outcomes
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {/* KPI Insights */}
      {campaign.insights && campaign.insights.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">KPI Insights</h4>
          <div className="space-y-2">
            {campaign.insights.map((insight: any) => (
              <div key={insight.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {insight.kpi_name}
                  </Badge>
                  <span className="text-sm">{insight.insight}</span>
                </div>
                <Badge variant={
                  insight.outcome === 'success' ? "success" : 
                  insight.outcome === 'failed' ? "destructive" : 
                  "default"
                }>
                  {insight.outcome || 'pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Channel information */}
      {campaign.scripts && Object.keys(campaign.scripts).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(campaign.scripts).map(channel => (
            <Badge key={channel} variant="outline">
              {channel}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

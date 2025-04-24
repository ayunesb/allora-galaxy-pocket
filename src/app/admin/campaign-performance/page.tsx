
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Loader2 } from "lucide-react";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { toast } from "sonner";
import { useCampaignPerformance } from "@/hooks/useCampaignPerformance";
import { CampaignMetricCards } from "./components/CampaignMetricCards";
import { PerformanceChart } from "./components/PerformanceChart";
import { CampaignList } from "./components/CampaignList";

export default function CampaignPerformancePage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { trackCampaignOutcome } = useCampaignIntegration();
  const { campaignPerformance, kpiMetrics, isLoading } = useCampaignPerformance();
  
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['campaign-performance-data'] });
      await queryClient.invalidateQueries({ queryKey: ['campaign-kpi-metrics'] });
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
      
      <CampaignMetricCards 
        campaignPerformance={campaignPerformance}
        isLoading={isLoading}
      />
      
      <PerformanceChart 
        kpiMetrics={kpiMetrics}
        isLoading={isLoading}
      />
      
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
                  .map((campaign) => (
                    <CampaignList 
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
                  .map((campaign) => (
                    <CampaignList 
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
                  .map((campaign) => (
                    <CampaignList 
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

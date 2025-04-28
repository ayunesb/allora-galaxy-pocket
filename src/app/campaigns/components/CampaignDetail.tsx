
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCampaign } from "../hooks/useCampaign";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorAlert from "@/components/ui/ErrorAlert";
import { Campaign } from "@/types/campaign";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignScripts from "./CampaignScripts";
import CampaignExecutionMetrics from "./CampaignExecutionMetrics";
import { ArrowLeft, Play, Pause } from "lucide-react";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { toast } from "sonner";

export default function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { campaign, isLoading, error, refetchCampaign } = useCampaign(campaignId);
  const { updateCampaignExecutionStatus } = useCampaignIntegration();
  const [isExecuting, setIsExecuting] = useState(false);

  const handleStatusChange = async (campaign: Campaign, newStatus: string) => {
    if (!campaignId) return;
    
    setIsExecuting(true);
    try {
      await updateCampaignExecutionStatus(
        campaignId,
        newStatus
      );
      toast.success(`Campaign ${newStatus === 'running' ? 'started' : 'paused'} successfully`);
      refetchCampaign();
    } catch (error) {
      toast.error(`Failed to ${newStatus === 'running' ? 'start' : 'pause'} campaign`);
      console.error("Error updating campaign status:", error);
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert title="Error loading campaign" description={error.message} retry={refetchCampaign} />;
  if (!campaign) return <ErrorAlert title="Campaign not found" description="The requested campaign could not be found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{campaign.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={campaign.status === 'active' ? 'default' : 'outline'}>
                {campaign.status}
              </Badge>
              {campaign.execution_status && (
                <Badge variant={
                  campaign.execution_status === 'running' ? 'success' :
                  campaign.execution_status === 'completed' ? 'outline' :
                  'secondary'
                }>
                  {campaign.execution_status}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {campaign.execution_status !== 'completed' && (
              <>
                {campaign.execution_status === 'running' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(campaign, 'paused')}
                    disabled={isExecuting}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleStatusChange(campaign, 'running')}
                    disabled={isExecuting}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {campaign.execution_status === 'paused' ? 'Resume' : 'Start'}
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-muted-foreground mb-6">{campaign.description || "No description"}</p>
          
          <Tabs defaultValue="scripts">
            <TabsList>
              <TabsTrigger value="scripts">Content</TabsTrigger>
              <TabsTrigger value="metrics">Performance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scripts" className="mt-4">
              <CampaignScripts campaign={campaign} />
            </TabsContent>
            
            <TabsContent value="metrics" className="mt-4">
              <CampaignExecutionMetrics campaign={campaign} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

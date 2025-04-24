
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  PauseCircle, 
  RefreshCw, 
  Calendar, 
  BarChart3, 
  AlertTriangle 
} from "lucide-react";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { Campaign } from "@/types/campaign";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface CampaignActionPanelProps {
  campaign: Campaign;
  onRefresh?: () => void;
}

export function CampaignActionPanel({ campaign, onRefresh }: CampaignActionPanelProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateCampaignExecutionStatus } = useCampaignIntegration();
  
  const isRunning = campaign.execution_status === 'running' || 
                    campaign.execution_status === 'in_progress';
  const isPaused = campaign.execution_status === 'paused';
  const isCompleted = campaign.execution_status === 'completed';
  
  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      // Update campaign status
      await updateCampaignExecutionStatus(
        campaign.id, 
        newStatus
      );
      
      // Show success message
      toast({
        title: "Campaign updated",
        description: `Campaign status changed to ${newStatus}`,
      });
      
      // Refresh data
      if (onRefresh) {
        onRefresh();
      }
      
      // Invalidate queries to refresh data elsewhere
      queryClient.invalidateQueries(['campaigns']);
      queryClient.invalidateQueries(['campaign', campaign.id]);
      
    } catch (error) {
      console.error("Failed to update campaign status:", error);
      toast({
        title: "Update failed",
        description: "Could not update campaign status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not started";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Campaign Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isRunning ? 'bg-green-100 text-green-800' : 
              isPaused ? 'bg-amber-100 text-amber-800' :
              isCompleted ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {campaign.execution_status?.charAt(0).toUpperCase() + 
                (campaign.execution_status?.slice(1) || 'Pending')}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Started:</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(campaign.execution_start_date)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Last Updated:</span>
            <span className="text-sm text-muted-foreground">
              {formatDate(campaign.execution_metrics?.last_updated)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            className="w-full"
            variant={isRunning ? "outline" : "default"}
            disabled={isUpdating || isCompleted}
            onClick={() => handleStatusChange('running')}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            {isRunning ? "Resume Campaign" : "Start Campaign"}
          </Button>
          
          <Button 
            className="w-full"
            variant="outline"
            disabled={isUpdating || !isRunning || isCompleted}
            onClick={() => handleStatusChange('paused')}
          >
            <PauseCircle className="mr-2 h-4 w-4" />
            Pause Campaign
          </Button>
          
          <Button 
            className="w-full"
            variant="outline"
            disabled={isUpdating}
            onClick={onRefresh}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isUpdating ? "animate-spin" : ""}`} />
            Refresh Metrics
          </Button>
        </div>
        
        <div className="border-t pt-4">
          <div className="grid grid-cols-3 gap-2">
            <Button variant="ghost" size="sm">
              <Calendar className="h-4 w-4" />
              <span className="sr-only">Schedule</span>
            </Button>
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4" />
              <span className="sr-only">Analytics</span>
            </Button>
            <Button variant="ghost" size="sm">
              <AlertTriangle className="h-4 w-4" />
              <span className="sr-only">Issues</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

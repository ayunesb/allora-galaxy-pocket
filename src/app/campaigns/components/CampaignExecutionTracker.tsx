
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Play, Pause, BarChart, RefreshCw } from "lucide-react";
import { useCampaignIntegration } from "@/hooks/useCampaignIntegration";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Campaign } from "@/types/campaign";

interface CampaignExecutionTrackerProps {
  campaign: Campaign;
  onUpdate?: () => void;
}

export function CampaignExecutionTracker({ campaign, onUpdate }: CampaignExecutionTrackerProps) {
  const { updateCampaignExecutionStatus, getCampaignExecutionMetrics } = useCampaignIntegration();
  const [metrics, setMetrics] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const result = await getCampaignExecutionMetrics(campaign.id);
      if (result.success) {
        setMetrics(result.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaign.id) {
      fetchMetrics();
    }
  }, [campaign.id]);

  const handleStatusUpdate = async (status: string) => {
    setLoading(true);
    try {
      await updateCampaignExecutionStatus(campaign.id, status);
      toast({
        title: "Campaign status updated",
        description: `Campaign is now ${status === 'in_progress' ? 'running' : status}`,
      });
      fetchMetrics();
      if (onUpdate) onUpdate();
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in_progress': return "text-green-600";
      case 'paused': return "text-amber-600";
      case 'completed': return "text-blue-600";
      case 'failed': return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getProgressPercent = () => {
    if (!metrics?.execution_metrics) return 0;
    
    // This is a simplified calculation - in a real app you'd use actual metrics
    const { views, clicks, conversions } = metrics.execution_metrics;
    if (views === 0) return 5; // Just started
    if (clicks === 0) return 25; // Has views but no clicks
    if (conversions === 0) return 60; // Has clicks but no conversions
    return 100; // Has conversions
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          Campaign Execution
          <Badge 
            variant={metrics?.execution_status === 'in_progress' ? 'default' : 'outline'}
            className={getStatusColor(metrics?.execution_status || 'pending')}
          >
            {metrics?.execution_status === 'in_progress' ? 'Running' : 
             metrics?.execution_status === 'pending' ? 'Not Started' : 
             metrics?.execution_status || 'Unknown'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{getProgressPercent()}%</span>
            </div>
            <Progress value={getProgressPercent()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 p-2 rounded-md">
              <div className="text-xs text-muted-foreground">Views</div>
              <div className="font-medium">{metrics?.execution_metrics?.views || 0}</div>
            </div>
            <div className="bg-muted/50 p-2 rounded-md">
              <div className="text-xs text-muted-foreground">Clicks</div>
              <div className="font-medium">{metrics?.execution_metrics?.clicks || 0}</div>
            </div>
            <div className="bg-muted/50 p-2 rounded-md">
              <div className="text-xs text-muted-foreground">Conversions</div>
              <div className="font-medium">{metrics?.execution_metrics?.conversions || 0}</div>
            </div>
            <div className="bg-muted/50 p-2 rounded-md">
              <div className="text-xs text-muted-foreground">CTR</div>
              <div className="font-medium">
                {metrics?.execution_metrics?.views && metrics?.execution_metrics?.clicks ? 
                  `${((metrics.execution_metrics.clicks / metrics.execution_metrics.views) * 100).toFixed(1)}%` : 
                  '0.0%'}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              disabled={loading || metrics?.execution_status === 'pending'}
              onClick={() => handleStatusUpdate('paused')}
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause
            </Button>
            <Button 
              size="sm" 
              variant={metrics?.execution_status === 'in_progress' ? 'outline' : 'default'}  
              className="flex-1"
              disabled={loading || metrics?.execution_status === 'in_progress'}
              onClick={() => handleStatusUpdate('in_progress')}
            >
              <Play className="h-4 w-4 mr-1" />
              Start
            </Button>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost"
            className="w-full"
            disabled={loading}
            onClick={fetchMetrics}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </Button>
          
          <div className="text-xs text-muted-foreground text-center">
            {metrics?.execution_metrics?.last_tracked ? 
              `Last updated: ${new Date(metrics.execution_metrics.last_tracked).toLocaleString()}` : 
              'No data yet'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

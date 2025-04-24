
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useKpiAlerts } from '@/hooks/useKpiAlerts';
import { useCampaignIntegration } from '@/hooks/useCampaignIntegration';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowUpRight, BarChart2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function KpiCampaignTracker() {
  const { campaignInsights, isLoading, triggerKpiCheck } = useKpiAlerts();
  const { trackCampaignOutcome } = useCampaignIntegration();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  useEffect(() => {
    // Check campaign outcomes once when component mounts
    const checkCampaigns = async () => {
      // Get campaigns with pending insights
      const pendingCampaigns = new Set(
        campaignInsights
          .filter(insight => insight.outcome === 'pending')
          .map(insight => insight.campaign_id)
      );
      
      // Track outcomes for each campaign
      for (const campaignId of pendingCampaigns) {
        if (campaignId) {
          trackCampaignOutcome(campaignId);
        }
      }
    };
    
    if (campaignInsights.length > 0) {
      checkCampaigns();
    }
  }, [campaignInsights, trackCampaignOutcome]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await triggerKpiCheck();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className="h-[300px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!campaignInsights || campaignInsights.length === 0) {
    return (
      <Card className="h-[300px]">
        <CardHeader>
          <CardTitle className="text-lg">Campaign KPI Tracking</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px]">
          <Bell className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            No campaign insights yet. Launch a campaign to start tracking KPIs and measure performance.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4" 
            onClick={() => navigate('/campaigns/center')}
          >
            Go to Campaign Center
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Group by outcome
  const pendingInsights = campaignInsights.filter(insight => insight.outcome === 'pending');
  const successInsights = campaignInsights.filter(insight => insight.outcome === 'success');
  const failedInsights = campaignInsights.filter(insight => insight.outcome === 'failed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex justify-between">
          <span>Campaign KPI Tracking</span>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={refreshData}
              disabled={isRefreshing}
              className={`h-8 w-8 p-0 ${isRefreshing ? 'animate-spin' : ''}`} 
            >
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => navigate('/insights/kpis')}
            >
              <ArrowUpRight className="h-4 w-4" />
              <span className="sr-only">View Details</span>
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingInsights.length > 0 && (
          <Alert className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900">
            <AlertTitle className="flex items-center">
              <span className="flex-1">Active Campaigns</span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {pendingInsights.length}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-sm text-blue-700 dark:text-blue-400">
              <div className="mt-2">
                {pendingInsights.slice(0, 2).map(insight => (
                  <div key={insight.id} className="flex items-center justify-between mt-1 text-sm">
                    <div className="truncate max-w-[220px]">
                      {insight.campaigns?.name || 'Unnamed Campaign'}
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {insight.kpi_name || 'KPI'}
                    </Badge>
                  </div>
                ))}
                {pendingInsights.length > 2 && (
                  <div className="text-xs mt-1 text-right">
                    +{pendingInsights.length - 2} more active
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {successInsights.length > 0 && (
          <Alert className="bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900">
            <AlertTitle className="flex items-center">
              <span className="flex-1">Successful Campaigns</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {successInsights.length}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-sm text-green-700 dark:text-green-400">
              <div className="mt-2">
                {successInsights.slice(0, 2).map(insight => (
                  <div key={insight.id} className="flex items-center justify-between mt-1 text-sm">
                    <div className="truncate max-w-[220px]">
                      {insight.campaigns?.name || 'Unnamed Campaign'}
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {insight.kpi_name || 'KPI'}
                    </Badge>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {failedInsights.length > 0 && (
          <Alert className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900">
            <AlertTitle className="flex items-center">
              <span className="flex-1">Underperforming Campaigns</span>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                {failedInsights.length}
              </Badge>
            </AlertTitle>
            <AlertDescription className="text-sm text-amber-700 dark:text-amber-400">
              <div className="mt-2">
                {failedInsights.slice(0, 2).map(insight => (
                  <div key={insight.id} className="flex items-center justify-between mt-1 text-sm">
                    <div className="truncate max-w-[220px]">
                      {insight.campaigns?.name || 'Unnamed Campaign'}
                    </div>
                    <Badge variant="outline" className="ml-2 shrink-0">
                      {insight.kpi_name || 'KPI'}
                    </Badge>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        {pendingInsights.length === 0 && successInsights.length === 0 && failedInsights.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <BarChart2 className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
            <p>No active campaign KPIs to track</p>
            <p className="text-sm mt-1">Try launching a new campaign</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

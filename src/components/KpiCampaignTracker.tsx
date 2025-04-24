
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useKpiAlerts } from '@/hooks/useKpiAlerts';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowUpRight, BarChart2 } from 'lucide-react';

export function KpiCampaignTracker() {
  const { campaignInsights, isLoading } = useKpiAlerts();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="h-[300px] flex items-center justify-center">
        <div className="text-center">
          <BarChart2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground/70" />
          <p className="text-sm text-muted-foreground">Loading campaign insights...</p>
        </div>
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
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 gap-1" 
            onClick={() => navigate('/insights/kpis')}
          >
            Details <ArrowUpRight className="h-3 w-3" />
          </Button>
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
              {pendingInsights.length} {pendingInsights.length === 1 ? 'campaign is' : 'campaigns are'} currently running and being tracked.
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
              {successInsights.length} {successInsights.length === 1 ? 'campaign has' : 'campaigns have'} achieved their target KPIs.
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
              {failedInsights.length} {failedInsights.length === 1 ? 'campaign has' : 'campaigns have'} not met target KPIs.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

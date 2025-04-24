
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CampaignMetricCardsProps {
  campaignPerformance: any[];
  isLoading: boolean;
}

export function CampaignMetricCards({ campaignPerformance, isLoading }: CampaignMetricCardsProps) {
  const calculateKpiSuccessRate = () => {
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
  };

  return (
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
                {calculateKpiSuccessRate()}
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
  );
}

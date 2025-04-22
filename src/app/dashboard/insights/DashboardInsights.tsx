
import { useState } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MetricsOverview } from "./components/MetricsOverview";
import { FeedbackAnalytics } from "./components/FeedbackAnalytics";
import { CampaignsList } from "./components/CampaignsList";
import { PluginUsageList } from "./components/PluginUsageList";
import { KpiMetricsDisplay } from "./components/KpiMetricsDisplay";
import { useInsightsData } from "./hooks/useInsightsData";
import { useMetricsSubscription } from "./hooks/useMetricsSubscription";
import KpiMetricCard from "./components/KpiMetricCard";
import InsightsDateFilter from "./components/InsightsDateFilter";

export default function DashboardInsights() {
  const [dateRange, setDateRange] = useState("30");
  const [campaignType, setCampaignType] = useState("all");
  
  useMetricsSubscription();

  const {
    kpiData,
    feedbackStats,
    pluginStats,
    topCampaigns,
    roiData,
    isLoading,
    campaignApprovalRate,
    aiRegenerationVolume,
    feedbackPositivityRatio,
    conversionRate
  } = useInsightsData(dateRange);

  const groupedFeedback = feedbackStats ? {
    "Strategies": {
      used: feedbackStats.used || 0,
      dismissed: feedbackStats.dismissed || 0
    }
  } : {};

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
        <InsightsDateFilter dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      <MetricsOverview
        feedbackStats={feedbackStats}
        pluginStats={pluginStats}
        kpiData={kpiData}
        roiData={roiData}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <KpiMetricCard 
          title="Conversion Rate"
          value={`${conversionRate.current}%`}
          trend={conversionRate.trend}
          change={conversionRate.change}
        />
        <KpiMetricCard 
          title="Campaign Approval Rate"
          value={`${campaignApprovalRate.current}%`}
          trend={campaignApprovalRate.trend}
          change={campaignApprovalRate.change}
        />
        <KpiMetricCard 
          title="AI Regeneration Volume"
          value={aiRegenerationVolume.current.toString()}
          trend={aiRegenerationVolume.trend}
          change={aiRegenerationVolume.change}
        />
        <KpiMetricCard 
          title="Feedback Positivity Ratio"
          value={`${feedbackPositivityRatio.current}%`}
          trend={feedbackPositivityRatio.trend}
          change={feedbackPositivityRatio.change}
        />
      </div>

      <Tabs defaultValue="feedback">
        <TabsList className="mb-4">
          <TabsTrigger value="feedback">Strategy Feedback</TabsTrigger>
          <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
          <TabsTrigger value="plugins">Plugin Usage</TabsTrigger>
          <TabsTrigger value="roi">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> 
              ROI Metrics
            </div>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback">
          <FeedbackAnalytics grouped={groupedFeedback} />
        </TabsContent>
        
        <TabsContent value="campaigns">
          <CampaignsList campaigns={topCampaigns || []} />
        </TabsContent>
        
        <TabsContent value="plugins">
          <PluginUsageList pluginStats={pluginStats} />
        </TabsContent>

        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle>ROI Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {roiData && roiData.trend ? (
                <div className="h-[400px]">
                  <KpiMetricsDisplay metrics={roiData} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
                  <p>Not enough ROI data available for the selected period.</p>
                  <p className="text-sm mt-2">Set up campaign cost tracking and revenue metrics in Settings.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

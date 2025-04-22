
import { useState } from "react";
import { Filter, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { MetricsOverview } from "./components/MetricsOverview";
import { FeedbackAnalytics } from "./components/FeedbackAnalytics";
import { CampaignsList } from "./components/CampaignsList";
import { PluginUsageList } from "./components/PluginUsageList";
import { KpiMetricsDisplay } from "./components/KpiMetricsDisplay";
import { useInsightsData } from "./hooks/useInsightsData";
import { useMetricsSubscription } from "./hooks/useMetricsSubscription";

export default function DashboardInsights() {
  const [dateRange, setDateRange] = useState("30");
  const [campaignType, setCampaignType] = useState("all");
  
  // Subscribe to real-time metrics updates
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
          <FeedbackAnalytics grouped={grouped} />
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

interface KpiMetricCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  change: number;
}

function KpiMetricCard({ title, value, trend, change }: KpiMetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500'}`}>
            {trend === 'up' ? (
              <ArrowUpRight className="h-4 w-4 mr-1" />
            ) : trend === 'down' ? (
              <ArrowDownRight className="h-4 w-4 mr-1" />
            ) : null}
            <span className="text-sm">{change > 0 ? '+' : ''}{change}%</span>
          </div>
        </div>
        <div className="mt-4 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full ${trend === 'up' ? 'bg-green-500' : trend === 'down' ? 'bg-red-500' : 'bg-gray-500'}`} 
            style={{ width: `${Math.min(Math.abs(change) * 3, 100)}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
}

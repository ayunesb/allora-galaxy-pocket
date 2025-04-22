
import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { MetricsOverview } from "./components/MetricsOverview";
import { FeedbackAnalytics } from "./components/FeedbackAnalytics";
import { CampaignsList } from "./components/CampaignsList";
import { PluginUsageList } from "./components/PluginUsageList";
import { useInsightsData } from "./hooks/useInsightsData";

export default function DashboardInsights() {
  const [dateRange, setDateRange] = useState("30");
  const [campaignType, setCampaignType] = useState("all");

  const {
    kpiData,
    feedbackStats,
    pluginStats,
    topCampaigns,
    grouped,
    isLoading
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
      />

      <Tabs defaultValue="feedback">
        <TabsList className="mb-4">
          <TabsTrigger value="feedback">Strategy Feedback</TabsTrigger>
          <TabsTrigger value="campaigns">Top Campaigns</TabsTrigger>
          <TabsTrigger value="plugins">Plugin Usage</TabsTrigger>
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
      </Tabs>
    </div>
  );
}

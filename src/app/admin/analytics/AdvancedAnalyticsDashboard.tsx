
import { useState, useMemo } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { KPISection } from "@/app/dashboard/components/KPISection";
import { PluginUsageChart } from "./PluginUsageChart";
import { useKpiMetrics } from "@/hooks/useKpiMetrics";
import { useExportService } from "@/hooks/useExportService";
import { MetricsCard } from "./MetricsCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdvancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30");
  const { data: kpiMetrics, isLoading } = useKpiMetrics(dateRange);
  const { isLoading: isExporting } = useExportService();

  // Fetch aggregated analytics data
  const { data: analyticsData } = useQuery({
    queryKey: ['analytics-summary', dateRange],
    queryFn: async () => {
      // This could be replaced with a dedicated Edge Function or direct query
      // depending on your data structure
      const { data: strategies, error: strategiesError } = await supabase
        .from('strategies')
        .select('count')
        .gte('created_at', `now() - interval '${dateRange} days'`);

      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('count')
        .eq('status', 'active');

      const { data: pluginUsage, error: pluginError } = await supabase
        .from('plugin_usage_logs')
        .select('count')
        .gte('created_at', `now() - interval '${dateRange} days'`);

      return {
        strategiesCount: strategies?.length || 0,
        activeCampaigns: campaigns?.length || 0,
        pluginUsageCount: pluginUsage?.length || 0
      };
    },
    enabled: true
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Advanced Analytics</h2>
        <DateRangePicker
          value={dateRange}
          onValueChange={(value) => setDateRange(value)}
          options={[
            { value: "7", label: "Last 7 days" },
            { value: "30", label: "Last 30 days" },
            { value: "90", label: "Last 90 days" }
          ]}
        />
      </div>

      {/* KPI Overview Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricsCard
          title="Strategies Created"
          value={analyticsData?.strategiesCount || 0}
          description="Total strategies in selected period"
        />
        <MetricsCard
          title="Active Campaigns"
          value={analyticsData?.activeCampaigns || 0}
          description="Currently running campaigns"
        />
        <MetricsCard
          title="Plugin Usage"
          value={analyticsData?.pluginUsageCount || 0}
          description="Total plugin interactions"
        />
      </div>

      {/* KPI Trends */}
      <Card>
        <CardHeader>
          <CardTitle>KPI Performance</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <KPISection />
        </CardContent>
      </Card>

      {/* Plugin Usage Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Plugin Usage Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <PluginUsageChart />
        </CardContent>
      </Card>

      {/* Export Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Export Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportGenerator 
            defaultType="kpi"
            showEmailOption={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

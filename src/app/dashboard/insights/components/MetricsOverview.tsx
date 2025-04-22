
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useMemo } from "react";

type MetricsOverviewProps = {
  feedbackStats: {
    used: number;
    dismissed: number;
  };
  pluginStats: Record<string, number>;
  kpiData?: any[];
};

export function MetricsOverview({ feedbackStats, pluginStats, kpiData }: MetricsOverviewProps) {
  const successRate = useMemo(() => {
    return feedbackStats.used + feedbackStats.dismissed > 0
      ? Math.round((feedbackStats.used / (feedbackStats.used + feedbackStats.dismissed)) * 100)
      : 0;
  }, [feedbackStats]);

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Strategy Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{successRate}%</div>
          <p className="text-sm text-muted-foreground">
            {feedbackStats.used} approved, {feedbackStats.dismissed} declined
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">Active Plugins</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{Object.keys(pluginStats).length}</div>
          <p className="text-sm text-muted-foreground">
            {Object.entries(pluginStats).map(([key, value], index, arr) => (
              <span key={key}>{key}{index < arr.length - 1 ? ', ' : ''}</span>
            ))}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md">ROI Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {kpiData?.find(m => m.metric.toLowerCase() === 'roi')?.value || '0'}x
          </div>
          <p className="text-sm text-muted-foreground">
            Based on current campaign performance
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

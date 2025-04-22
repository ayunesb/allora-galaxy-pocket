
import { SuccessRateCard } from "./cards/SuccessRateCard";
import { ActivePluginsCard } from "./cards/ActivePluginsCard";
import { RoiTrendCard } from "./cards/RoiTrendCard";

type MetricsOverviewProps = {
  feedbackStats: {
    used: number;
    dismissed: number;
  };
  pluginStats: Record<string, number>;
  kpiData?: any[];
  roiData?: {
    current: number;
    trend: 'up' | 'down' | 'neutral';
    change: number;
  };
};

export function MetricsOverview({ feedbackStats, pluginStats, kpiData, roiData }: MetricsOverviewProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-6">
      <SuccessRateCard feedbackStats={feedbackStats} />
      <ActivePluginsCard pluginStats={pluginStats} />
      <RoiTrendCard roiData={roiData} kpiData={kpiData} />
    </div>
  );
}


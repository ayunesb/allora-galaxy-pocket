
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface RoiTrendCardProps {
  roiData?: {
    current: number;
    trend: 'up' | 'down' | 'neutral';
    change: number;
  };
  kpiData?: any[];
}

export function RoiTrendCard({ roiData, kpiData }: RoiTrendCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          ROI Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {roiData?.current ? `${roiData.current.toFixed(1)}x` : (kpiData?.find(m => m.metric?.toLowerCase() === 'roi')?.value || '0x')}
        </div>
        
        {roiData && roiData.change !== 0 && (
          <p className={`text-sm ${roiData.trend === 'up' ? 'text-green-500' : roiData.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'}`}>
            {roiData.trend === 'up' ? '↑' : roiData.trend === 'down' ? '↓' : ''} 
            {roiData.change > 0 ? '+' : ''}{roiData.change}% from previous period
          </p>
        )}
        
        {!roiData && (
          <p className="text-sm text-muted-foreground">
            Based on current campaign performance
          </p>
        )}
      </CardContent>
    </Card>
  );
}


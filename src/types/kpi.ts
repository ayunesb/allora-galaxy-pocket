
export interface KpiMetric {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  changePercent?: number;
  historicalData?: Array<{
    value: number;
    recorded_at: string;
  }>;
}

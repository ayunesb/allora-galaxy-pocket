
export interface KpiMetric {
  label: string;
  value: string | number;
  trend?: "up" | "down";
  changePercent?: number;
}

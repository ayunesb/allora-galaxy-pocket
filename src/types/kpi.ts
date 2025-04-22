
export interface KpiMetric {
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  changePercent?: number;
  historicalData?: Array<{
    value: number;
    recorded_at: string;
  }>;
}

export interface KpiAlert {
  id: string;
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  triggered_at?: string;
  status: 'active' | 'triggered' | 'resolved';
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface KpiMetricHistory {
  id: string;
  metric: string;
  value: number;
  recorded_at: string;
  tenant_id: string;
}

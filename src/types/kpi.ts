
export type KpiTrend = 'up' | 'down' | 'neutral';

export interface KpiMetric {
  id?: string;
  tenant_id?: string;
  kpi_name?: string;
  metric?: string;
  label?: string;
  value: number;
  trend?: KpiTrend;
  changePercent?: number;
  target?: number;
  trend_direction?: KpiTrend;
  last_value?: number;
  created_at?: string;
  updated_at?: string;
}

export interface KpiAlert {
  id: string;
  kpi_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  current_value: number;
  previous_value?: number;
  target?: number;
  threshold?: number;
  percent_change?: number;
  outcome?: string;
  status: 'pending' | 'acknowledged' | 'resolved';
  triggered_at: string;
  created_at: string;
  tenant_id: string;
  campaign_id?: string;
}

export interface KpiInsight {
  id: string;
  kpi_name: string;
  insight: string;
  impact_level?: string;
  suggested_action?: string;
  campaign_id?: string;
  tenant_id: string;
  created_at: string;
}


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
  description?: string;
  status?: string;
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
  status: 'pending' | 'acknowledged' | 'resolved' | 'triggered';
  triggered_at: string;
  created_at: string;
  tenant_id: string;
  campaign_id?: string;
  condition?: string;
  message?: string;
}

export interface KpiAlertRule {
  id: string;
  name: string;
  kpi_name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high';
  message: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  tenant_id: string;
  last_triggered?: string;
  active?: boolean;
  compare_period?: string;
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

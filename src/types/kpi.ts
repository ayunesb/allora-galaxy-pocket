
export interface KpiMetric {
  id?: string;
  tenant_id?: string;
  kpi_name?: string;
  metric?: string;
  value: string | number;
  recorded_at?: string;
  created_at?: string;
  updated_at?: string;
  trend?: 'up' | 'down' | 'neutral';
  changePercent?: number;
  target?: number | string;
}

export interface KpiAlert {
  id: string;
  tenant_id: string;
  kpi_name: string;
  description: string;
  message?: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'triggered';
  current_value: number;
  previous_value?: number;
  threshold?: number;
  percent_change?: number;
  campaign_id?: string;
  triggered_at?: string;
  created_at: string;
  condition?: string;
  target?: number;
  metric?: string;
  outcome?: string;
}

export interface KpiInsight {
  id: string;
  kpi_name: string;
  insight: string;
  impact_level?: string;
  campaign_id?: string;
  created_at: string;
  tenant_id: string;
  outcome?: string;
  suggested_action?: string;
}

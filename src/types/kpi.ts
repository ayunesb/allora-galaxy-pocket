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
  unit?: string;
  label?: string;
  description?: string;
  trend_direction?: 'up' | 'down' | 'neutral';
  last_value?: number;
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

export interface KpiAlertRule {
  id: string;
  tenant_id: string;
  kpi_name: string;
  name: string;
  condition: string;
  threshold: number;
  message: string;
  severity: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive';
  active: boolean;
  created_at: string;
  updated_at?: string;
  last_triggered?: string;
  compare_period?: string;
}

export interface UnifiedAlert {
  id: string;
  kpi_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'pending' | 'resolved' | 'triggered';
  created_at: string;
  triggered_at?: string;
  message?: string;
  current_value?: number;
  previous_value?: number;
  percent_change?: number;
  campaign_id?: string;
  tenant_id: string;
  source_type: 'kpi_alert' | 'kpi_insight';
  threshold?: number;
  condition?: string;
}

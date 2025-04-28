
// Adding or updating KPI types to include KpiAlertRule

export interface KpiMetric {
  id: string;
  metric?: string;
  kpi_name?: string;
  value: number;
  trend?: 'up' | 'down' | 'neutral';
  changePercent?: number;
  created_at: string;
  updated_at?: string;
  tenant_id?: string;
  recorded_at?: string;
}

export interface KpiAlert {
  id: string;
  kpi_name: string;
  metric?: string;
  description: string;
  message?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  condition?: string;
  target?: number;
  current_value: number;
  previous_value?: number;
  percent_change?: number;
  campaign_id?: string;
  tenant_id: string;
  triggered_at: string;
  created_at: string;
  status: 'pending' | 'triggered' | 'acknowledged' | 'resolved';
  outcome?: string;
}

export interface KpiAlertRule {
  id: string;
  kpi_name: string;
  condition: '<' | '>' | 'falls_by_%' | 'rises_by_%';
  threshold: number;
  compare_period: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  campaign_id?: string;
  tenant_id: string;
  created_at: string;
  updated_at?: string;
  active: boolean;
}


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
  label?: string;
  description?: string;
  status?: string;
  target?: number;
  trend_direction?: 'up' | 'down' | 'neutral';
  last_value?: number;
}

export interface KpiAlert {
  id: string;
  kpi_name: string;
  metric?: string;
  description: string;
  message?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  condition?: '<' | '>' | 'falls_by_%' | 'rises_by_%';
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
  suggested_action?: string;
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

export interface CampaignInsight {
  id: string;
  kpi_name: string;
  insight: string;
  suggested_action?: string;
  impact_level?: string;
  campaign_id?: string;
  tenant_id?: string;
  created_at?: string;
  campaigns?: {
    id: string;
    name: string;
    status?: string;
  };
}

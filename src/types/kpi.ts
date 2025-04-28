
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
  outcome: string;
  status: string;
  triggered_at: string;
  created_at: string;
  tenant_id: string;
  campaign_id?: string;
  metric?: string;
  condition?: string;
}

export interface KpiAlertRule {
  id: string;
  tenant_id: string;
  kpi_name: string;
  condition: string;
  threshold: number;
  compare_period: string;
  severity: string;
  created_at: string;
  active: boolean;
  campaign_id?: string;
}

export interface KpiMetric {
  id: string;
  metric: string;
  value: number;
  recorded_at: string;
  updated_at: string;
  created_at: string;
  tenant_id: string;
  target?: number;
  status?: string;
}

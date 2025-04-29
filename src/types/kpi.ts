
export interface KpiMetric {
  id: string;
  kpi_name?: string;
  metric?: string;
  value: string | number;
  target?: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trend_direction?: 'up' | 'down' | 'neutral';
  changePercent?: number;
  updated_at?: string;
  created_at?: string;
  tenant_id: string;
  label?: string;
  description?: string;
  category?: string;
}

export interface KpiAlert {
  id: string;
  kpi_name: string;
  description: string;
  severity: string;
  message?: string;
  created_at: string;
  tenant_id: string;
  status?: string;
  triggered_at?: string;
}

// Add this type for alert rules
export interface KpiAlertRule {
  id: string;
  name: string;
  kpi_name: string;
  condition: string;
  threshold: number;
  severity: string;
  message: string;
  status: string;
  active: boolean;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
  last_triggered?: string;
  compare_period?: string;
}

// Add this type if it doesn't exist already
export interface UnifiedKpiAlert {
  id: string;
  kpi_name: string;
  description: string;
  severity: string;
  message?: string;
  created_at: string;
  source_type?: 'kpi_alert' | 'kpi_insight';
  tenant_id: string;
}

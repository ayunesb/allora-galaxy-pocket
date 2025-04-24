
export interface KpiMetric {
  id: string;
  kpi_name: string;
  value: number;
  target?: number;
  last_value?: number;
  trend_direction?: 'up' | 'down' | 'neutral';
  category?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  updated_at: string;
  tenant_id: string;
  
  // Additional fields used in the UI components
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
  changePercent?: number;
  historicalData?: Array<{ value: number; date: string }>;
  
  // GA4 specific fields
  source?: string;
  last_sync?: string;
}

export interface KpiFilter {
  dateRange: string;
  category?: string;
  searchQuery?: string;
}

export interface KpiAlert {
  id: string;
  kpi_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  current_value?: number;
  previous_value?: number;
  target?: number;
  percent_change?: number;
  outcome: 'pending' | 'success' | 'failed' | 'resolved';
  created_at: string;
  tenant_id: string;
  campaign_id?: string;
}

export interface KpiAlertRule {
  id: string;
  tenant_id: string;
  kpi_name: string;
  condition: '<' | '>' | 'falls_by_%' | 'rises_by_%';
  threshold: number;
  compare_period: '1d' | '7d' | '30d';
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  active: boolean;
  campaign_id?: string;
}

export interface KpiTrendPoint {
  value: number;
  date: string;
}

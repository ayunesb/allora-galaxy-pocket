
export interface KpiMetric {
  id: string;
  kpi_name: string;
  value: number;
  target?: number;
  last_value?: number;
  trend_direction?: 'up' | 'down' | 'neutral';
  category?: string;
  status?: 'success' | 'warning';
  updated_at: string;
  tenant_id: string;
}

export interface KpiFilter {
  dateRange: string;
  category?: string;
  searchQuery?: string;
}

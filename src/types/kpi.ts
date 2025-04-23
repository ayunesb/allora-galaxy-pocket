
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
  
  // Additional fields used in the UI components
  label?: string;
  trend?: 'up' | 'down' | 'neutral';
  changePercent?: number;
  historicalData?: Array<{ value: number; recorded_at: string }>;
}

export interface KpiFilter {
  dateRange: string;
  category?: string;
  searchQuery?: string;
}

export interface KpiAlert {
  id: string;
  metric: string;
  threshold: number;
  condition: 'above' | 'below';
  status: 'active' | 'triggered' | 'resolved';
  triggered_at?: string;
  tenant_id: string;
  created_at: string;
}

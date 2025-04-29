
export interface SystemMetric {
  id: string;
  metric_name: string;
  value: number;
  recorded_at?: string;
  tenant_id?: string;
  metadata?: Record<string, any>;
}

export interface HealthMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  trend?: 'up' | 'down' | 'stable';
}

export interface PerformanceMetric {
  component: string;
  operation: string;
  duration_ms: number;
  success: boolean;
  timestamp: string;
}

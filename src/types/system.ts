
export interface SystemLogEntry {
  id: string;
  message: string;
  event_type: string;
  created_at: string;
  meta?: Record<string, any>;
  user_id?: string;
  tenant_id?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemAlert {
  id: string;
  message: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'active' | 'resolved' | 'acknowledged';
  created_at: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
}

export interface SystemMetric {
  id: string;
  metric_name: string;
  value: number;
  recorded_at: string;
  metadata?: Record<string, any>;
}

export interface SystemHealth {
  overall: boolean;
  database: boolean;
  auth: boolean;
  storage: boolean;
  functions: boolean;
  maintenance: boolean | null;
  lastChecked: string;
}

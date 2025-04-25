
export interface SystemLog {
  id: string;
  created_at: string;
  tenant_id: string;
  user_id?: string;
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  // Add timestamp field as an alias to created_at for backward compatibility
  timestamp?: string | Date;
  severity?: string;
  status?: 'success' | 'error' | 'warning';
}

export interface SystemLogFilter {
  dateRange: number;
  eventType: string;
  userId: string;
  search: string;
  severity?: 'low' | 'medium' | 'high';
  status?: 'success' | 'error' | 'warning';
}

export interface LogActivityParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
}

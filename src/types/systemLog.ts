
export interface SystemLog {
  id: string;
  event_type: string;
  message: string;
  user_id: string | null;
  tenant_id: string;
  meta?: Record<string, any>;
  created_at: string;
}

export interface SystemLogFilter {
  dateRange?: number;
  eventType?: string;
  userId?: string;
  search?: string;
}

export interface LogActivityParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
}

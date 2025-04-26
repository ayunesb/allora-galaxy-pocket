
export type LogSeverity = 'info' | 'warning' | 'error' | 'critical' | 'success';

export interface SystemLog {
  id: string;
  created_at: string;
  tenant_id?: string;
  user_id?: string;
  event_type: string;
  message: string;
  meta?: Record<string, any>;
  severity?: LogSeverity;
}

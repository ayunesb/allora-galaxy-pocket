
export type LogSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface SystemLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  event_type: string;
  message: string;
  service?: string;
  severity: LogSeverity;
  meta?: Record<string, any>;
  created_at: string;
}

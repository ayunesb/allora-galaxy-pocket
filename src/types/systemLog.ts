
export type LogSeverity = 'info' | 'warning' | 'error' | 'success';

export interface SystemLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  event_type: string;
  message: string;
  meta?: {
    severity?: LogSeverity;
    service?: string;
    [key: string]: any;
  };
  created_at: string;
  timestamp?: string;
  severity?: LogSeverity;
  service?: string;
}

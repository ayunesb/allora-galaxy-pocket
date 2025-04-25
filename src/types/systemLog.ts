
export type LogSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info' | 'error' | 'warning' | 'success';

export interface SystemLog {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
  timestamp?: string; // Add timestamp as an optional property
  meta?: {
    severity?: LogSeverity;
    [key: string]: any;
  };
  user_id?: string;
  tenant_id?: string;
  service?: string;
  severity?: LogSeverity; // Convenience accessor
}

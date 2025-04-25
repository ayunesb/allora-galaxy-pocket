
export type LogSeverity = 'info' | 'warning' | 'error' | 'success';

export interface SystemLog {
  id: string;
  event_type: string;
  message: string;
  created_at: string;
  user_id?: string;
  tenant_id?: string;
  meta?: Record<string, any>;
  severity?: LogSeverity;
  timestamp?: string; // Add timestamp property
  service?: string;   // Add service property
}

export interface LogActivity {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
}

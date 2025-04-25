
/**
 * SystemLog interface representing system log entries
 */
export interface SystemLog {
  id: string;
  event_type: string;
  message: string;
  severity?: LogSeverity;
  service?: string;
  created_at: string;
  timestamp?: string;
  meta?: Record<string, any>;
  tenant_id?: string;
  user_id?: string;
  status?: 'success' | 'error' | 'warning';
}

export type LogSeverity = 'info' | 'warning' | 'error' | 'all';

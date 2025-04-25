
export interface SystemLog {
  id: string;
  tenant_id: string;
  user_id?: string;
  event_type: string;
  message: string;
  meta?: {
    severity?: 'info' | 'warning' | 'error' | 'success';
    [key: string]: any;
  };
  created_at: string;
  timestamp?: string;
  severity?: string;
}

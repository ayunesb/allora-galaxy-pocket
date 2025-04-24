
export interface SystemLog {
  id: string;
  event_type: string;
  message: string;
  meta?: any;
  tenant_id: string;
  user_id?: string;
  created_at: string;
}


export interface Notification {
  id: string;
  tenant_id: string;
  event_type: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}


export interface Strategy {
  id: string;
  title: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
  tenant_id: string | null;
  industry?: string | null;
  goal?: string | null;
  confidence?: string | null;
  status?: string | null;
}

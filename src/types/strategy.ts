
export interface Strategy {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at?: string | null;
  tenant_id: string;
  industry?: string | null;
  goal?: string | null;
  confidence?: string | null;
  status?: string | null;
  approved_at?: string | null;
  metrics_baseline?: Record<string, any>;
  tags?: string[];
  generated_by?: string;
}

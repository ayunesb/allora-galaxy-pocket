
export interface Strategy {
  id: string;
  title?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  tenant_id: string;
  status?: string;
  user_id?: string;
  tags?: string[];
  approved_at?: string;
  failure_reason?: string;
  metrics_baseline?: Record<string, any>;
  generated_by?: string;
  health_score?: number;
  impact_score?: number;
  industry?: string;
  goal?: string;
  confidence?: string; // Added confidence property
}

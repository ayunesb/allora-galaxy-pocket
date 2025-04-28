
export interface Decision {
  id: string;
  strategy_id: string;
  title?: string;
  description?: string;
  agent: string;
  status: string;
  version: number;
  prompt: string;
  auto_approved?: boolean;
  created_at: string;
  approved_at?: string;
  changed_by?: string;
  tenant_id: string;
}

export interface ApprovalStats {
  total_approved: number;
  ai_approved: number;
  human_approved: number;
}

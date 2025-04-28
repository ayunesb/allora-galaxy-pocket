
export interface Decision {
  id: string;
  strategy_id: string;
  decision: string;
  approved: boolean;
  auto_approved: boolean;
  confidence_score: number;
  decision_made_at: string;
  created_at: string;
  tenant_id: string;
  strategy_title?: string;
  agent_name?: string;
}

export interface ApprovalStats {
  total_approved: number;
  ai_approved: number;
  human_approved: number;
}

export interface WeeklySummary {
  id: string;
  summary: string;
  week_start: string;
  generated_at: string;
  metadata: {
    total_decisions: number;
    ai_approval_rate: number;
  };
}

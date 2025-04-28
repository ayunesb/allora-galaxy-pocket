
export type StrategyStatus = 'approved' | 'rejected' | 'pending' | 'draft';

export interface Strategy {
  id: string;
  title?: string;
  description?: string;
  status: StrategyStatus;
  created_at: string;
  tenant_id?: string;
  user_id?: string;
  tags?: string[];
  generated_by?: string;
  assigned_agent?: string;
  auto_approved?: boolean;
  impact_score?: number;
  health_score?: number;
  approved_at?: string;
  metrics_baseline?: Record<string, any>;
  onboarding_data?: Record<string, any>;
  diagnosis?: Record<string, any>;
  failure_reason?: string;
  retry_prompt?: string;
  is_public?: boolean;
}

export interface StrategyFeedback {
  id: string;
  strategy_title: string;
  action: 'used' | 'dismissed';
  user_id?: string;
  tenant_id?: string;
  created_at: string;
}

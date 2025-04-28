
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'pending' | 'rejected' | 'approved';
export type ExecutionStatus = 'pending' | 'scheduled' | 'running' | 'completed' | 'failed';

export interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  scripts?: Record<string, string>;
  strategy_id?: string;
  generated_by_agent_id?: string;
  execution_status?: ExecutionStatus;
  execution_metrics?: Record<string, any>;
  execution_start_date?: string;
  last_metrics_update?: string;
  metrics?: Record<string, any>;
}

export interface FeedbackLog {
  id?: string;
  strategy_title: string;
  action: 'used' | 'dismissed';
  created_at?: string;
  tenant_id?: string;
  user_id?: string;
}


// Update the Campaign and ExecutionStatus types

export type CampaignStatus = 'active' | 'draft' | 'paused' | 'completed' | 'approved';
export type ExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'successful';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  tenant_id?: string;
  strategy_id?: string;
  generated_by_agent_id?: string;
  created_at: string;
  updated_at: string;
  scripts?: Record<string, string>;
  execution_metrics?: {
    views?: number;
    clicks?: number;
    conversions?: number;
    last_updated?: string;
    [key: string]: any;
  };
  execution_status?: ExecutionStatus;
  execution_start_date?: string;
  metrics?: Record<string, any>;
  last_metrics_update?: string;
}

export interface CampaignOutcome {
  id: string;
  campaign_id: string;
  tenant_id: string;
  outcome_type: string;
  outcome_value: number;
  details?: Record<string, any>;
  recorded_by?: string;
  created_at: string;
}


export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived' | 'pending' | 'approved';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  tenant_id?: string;
  strategy_id?: string;
  execution_status?: string;
  execution_start_date?: string;
  execution_metrics?: Record<string, any>;
  metrics?: Record<string, any>;
  scripts?: {
    channels?: Record<string, any>;
    [key: string]: any;
  };
  last_metrics_update?: string;
  generated_by_agent_id?: string;
  type?: string;
}

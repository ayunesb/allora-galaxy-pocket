
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: "active" | "paused" | "draft";
  tenant_id?: string;
  scripts?: Record<string, string>;
  created_at: string;
  generated_by_agent_id?: string;
  execution_status?: string;
  execution_start_date?: string;
  execution_metrics?: Record<string, any>;
  strategy_id?: string;
}

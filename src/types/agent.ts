
export interface AgentMemory {
  id: string;
  agent_name: string;
  tenant_id: string;
  insight_id?: string;
  summary: string;
  tags: string[];
  context: string;
  type: string;
  timestamp: string;
  xp_delta: number;
  remix_count?: number;
  is_user_submitted?: boolean;
}


export type AgentMemoryLog = {
  id: string;
  agent_name: string;
  context: string;
  type: string;
  timestamp: string;
  tenant_id: string;
  xp_delta?: number;
  is_user_submitted?: boolean;
  remix_count?: number;
  ai_feedback?: string;
  ai_rating?: number;
  summary?: string;
  tags?: string[];
};

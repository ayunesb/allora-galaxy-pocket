
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

// Alias AgentMemory to AgentMemoryLog for backward compatibility
export type AgentMemory = AgentMemoryLog;

export interface AgentCollabMessage {
  id: string;
  session_id: string;
  agent: string;
  message: string;
  created_at: string;
}

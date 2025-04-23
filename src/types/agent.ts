
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

// Add missing type for AgentCollabMessage
export interface AgentCollabMessage {
  id: string;
  session_id: string;
  agent: string;
  message: string;
  created_at: string;
}

// Add missing type for AgentMemoryLog (using AgentMemory as base)
export type AgentMemoryLog = AgentMemory;

// Add missing type for PromptPerformanceData
export interface PromptPerformanceData {
  agent: string;
  version: number;
  total: number;
  success_count: number;
  success_rate: number;
}

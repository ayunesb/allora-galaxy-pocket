
// Update the agent.ts file with missing AgentMemory and other interfaces

export interface AgentProfile {
  id: string;
  agent_name: string;
  role: string;
  tone?: string;
  avatar_url?: string;
  enabled_tools?: string[];
  language?: string;
  channels?: string[];
  memory_scope?: string[];
  tenant_id: string;
  created_by?: string;
  memory_score?: number;
  last_memory_update?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AgentFeedback {
  id: string;
  agent: string;
  from_agent?: string;
  to_agent?: string;
  feedback?: string;
  rating?: number;
  type?: string;
  task_id?: string;
  strategy_id?: string;
  campaign_id?: string;
  tenant_id: string;
  created_at: string;
}

export interface AgentPromptVersion {
  id: string;
  agent_name: string;
  prompt: string;
  version: number;
  edited_by?: string;
  explanation?: string;
  tenant_id: string;
  created_at: string;
}

export interface AgentPromptVote {
  id: string;
  agent_name: string;
  voter_agent: string;
  version: number;
  vote: number;
  tenant_id: string;
  created_at: string;
}

export interface AgentMemory {
  id: string;
  tenant_id: string;
  agent_name: string;
  context: string;
  summary?: string;
  type: string;
  timestamp: string;
  xp_delta?: number;
  ai_rating?: number;
  ai_feedback?: string;
  is_user_submitted?: boolean;
  tags?: string[];
  remix_count?: number;
}

export interface AgentMemoryLog extends AgentMemory {
  feedback?: string;
}

export interface AgentCollabMessage {
  id: string;
  session_id: string;
  agent: string;
  message: string;
  tenant_id: string;
  created_at: string;
}

export interface PromptPerformanceData {
  agent_name: string;
  version: number;
  success_rate: number;
  upvotes: number;
  downvotes: number;
  total_executions: number;
  last_executed: string;
}

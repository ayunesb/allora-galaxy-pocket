
export interface AgentProfile {
  id: string;
  agent_name: string;
  role: string;
  tone: string;
  language: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  memory_score?: number;
  last_memory_update?: string;
  memory_scope?: string[];
  channels?: string[];
  enabled_tools?: string[];
  tenant_id: string;
  created_by?: string;
  model_provider?: string;
}

export interface AgentCollabMessage {
  id: string;
  agent: string;
  message: string;
  session_id: string;
  created_at: string;
  tenant_id: string;
}

export interface AgentFeedback {
  id: string;
  agent: string;
  from_agent?: string; // Added missing field
  to_agent?: string;   // Added missing field
  feedback?: string;
  type?: string;
  rating?: number;
  task_id?: string;
  strategy_id?: string; // Added missing field
  tenant_id: string;
  created_at: string;
}

export interface SystemLog {
  id: string;
  event_type: string;
  message: string;
  meta?: any;
  tenant_id: string;
  user_id?: string;
  created_at: string;
  severity?: string;
}

export type SpinnerSize = "sm" | "md" | "lg" | "xl";

// Adding missing types based on errors
export interface AgentMemory {
  id: string;
  agent_name: string;
  context: string;
  summary?: string;
  type: string;
  timestamp: string;
  tenant_id: string;
  xp_delta?: number;
  is_user_submitted?: boolean;
  ai_rating?: number;
  ai_feedback?: string;
  remix_count?: number;
  tags?: string[];
}

export interface AgentMemoryLog {
  id: string;
  agent_name: string;
  context: string;
  type: string;
  timestamp: string;
  xp_delta?: number;
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

export interface AgentSessionInit {
  sessionId: string;
}

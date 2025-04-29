
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
  from_agent?: string;
  to_agent?: string;
  feedback?: string;
  type?: string;
  rating?: number;
  task_id?: string;
  strategy_id?: string;
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

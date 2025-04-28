
export interface AgentMemory {
  id: string;
  agent_name: string;
  context: string;
  tenant_id: string;
  type: string;
  timestamp: string;
  is_user_submitted: boolean;
  ai_feedback?: string;
  ai_rating?: number;
  remix_count?: number;
  xp_delta?: number;
  summary?: string;
  tags?: string[];
}

export interface AgentProfile {
  id: string;
  agent_name: string; // Make sure this is required for database operations
  role: string;
  tone: string;
  avatar_url?: string;
  language: string;
  enabled_tools?: string[];
  memory_scope: string[];
  channels: string[];
  memory_score?: number;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  created_by?: string;
  last_memory_update?: string;
}

export interface AgentFeedback {
  id: string;
  agent: string;
  type?: string;
  feedback?: string;
  rating?: number;
  created_at: string;
  tenant_id: string;
  task_id?: string;
  from_agent?: string;
  to_agent?: string;
  strategy_id?: string;
  campaign_id?: string;
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

export interface AgentTask {
  id: string;
  agent: string;
  task_type: string;
  status: string;
  created_at: string;
  executed_at?: string;
  tenant_id: string;
  prompt_version?: number;
  payload?: any;
  result?: any;
  error?: string;
}

export interface AgentMemoryLog extends AgentMemory {
  summary: string;
  tags: string[];
}

export interface AgentCollabMessage {
  id: string;
  agent: string;
  message: string;
  session_id: string;
  created_at: string;
  tenant_id: string;
}

export interface ApprovalStatus {
  id: string;
  item_id: string;
  item_type: 'campaign' | 'strategy' | 'pricing' | 'hire';
  status: 'approved' | 'rejected' | 'pending';
  approved_by?: string;
  approved_at?: string;
  tenant_id: string;
  feedback?: string;
}

export interface Decision {
  id: string;
  strategy_id: string;
  strategy_title?: string;
  decision: string;
  confidence_score: number;
  auto_approved: boolean;
  decision_made_at: string;
  created_at: string;
  strategies?: {
    id: string;
    title: string;
  };
}

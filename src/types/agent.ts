
export interface AgentMemoryLog {
  id: string;
  agent_name: string;
  type: string;
  context: string;
  timestamp: string;
  tenant_id: string;
}

export interface AgentCollabMessage {
  id: string;
  agent: string;
  message: string;
  session_id: string;
  created_at: string;
  tenant_id: string;
}

export interface AgentPromptVersion {
  id: string;
  agent_name: string;
  prompt: string;
  version: number;
  created_at: string;
  edited_by?: string;
  tenant_id?: string;
}

export interface AgentTask {
  id: string;
  agent: string;
  task_type: string;
  prompt_version?: number;
  status: 'pending' | 'success' | 'failed';
  executed_at?: string;
  tenant_id: string;
}

export interface PromptPerformanceData {
  agent: string;
  version: number;
  total: number;
  success_count: number;
  success_rate: number;
}

export interface PromptSwitchRecommendation {
  agent: string;
  current_version: number;
  suggested_version: number;
  performance_delta: number;
}

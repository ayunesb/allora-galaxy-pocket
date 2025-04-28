
// Create or update the agent.ts file with missing AgentProfile and AgentFeedback types

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

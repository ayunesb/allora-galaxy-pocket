
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

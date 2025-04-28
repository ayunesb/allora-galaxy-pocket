
export interface AgentPerformanceLog {
  id: string;
  tenant_id: string;
  strategy_id: string;
  agent_name: string;
  success_rate: number;
  feedback_score: number;
  notes: string;
  created_at: string;
  metrics?: Record<string, any>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  previous_value?: number;
  change_percent?: number;
  target?: number;
  status: 'improving' | 'declining' | 'stable';
}

export interface AgentPerformanceSummary {
  agent_name: string;
  total_strategies: number;
  success_rate: number;
  avg_feedback_score: number;
  top_performing_strategy?: string;
  recent_improvements: number;
  recent_declines: number;
}

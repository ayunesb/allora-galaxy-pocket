
export interface Strategy {
  id: string;
  tenant_id?: string;
  title: string;
  description: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  auto_approved?: boolean;
  impact_score?: number;
  target_audience?: string;
  goals?: string[];
  kpis?: string[];
  channels?: string[];
  tags?: string[];
  created_at: string;
  updated_at?: string;
  version?: number;
  is_public?: boolean;
  
  // Marketing strategy properties
  industry?: string;
  goal?: string;  // Single primary goal (different from goals array)
  confidence?: string; // AI confidence level in the strategy
  metrics_baseline?: Record<string, any>; // Baseline metrics for KPI tracking
  generated_by?: string; // Agent that generated the strategy
  assigned_agent?: string; // Agent assigned to the strategy
  health_score?: number; // Health score for the strategy
  approved_at?: string; // When the strategy was approved
  execution_status?: string; // Current execution status
  execution_metrics?: Record<string, any>; // Metrics related to execution
  onboarding_data?: Record<string, any>; // Data from onboarding used for strategy
}

export interface StrategyVersionDiff {
  older: {
    version: number;
    changes: string;
    created_at: string;
  };
  newer: {
    version: number;
    changes: string;
    created_at: string;
  };
  added: string[];
  removed: string[];
  modified: {
    [key: string]: {
      before: any;
      after: any;
    }
  }
}

export interface StrategyVersion {
  id: string;
  strategy_id: string;
  version: number;
  data: Strategy;
  created_at: string;
  created_by?: string;
  comment?: string;
}

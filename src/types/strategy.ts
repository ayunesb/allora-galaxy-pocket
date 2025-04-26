
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
}

export interface StrategyVersionDiff {
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


import { Json } from '@/integrations/supabase/types';

export type StrategyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived' | 'active' | 'completed';

export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: StrategyStatus;
  tenant_id: string;
  user_id: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  generated_by: string;
  assigned_agent: string;
  auto_approved: boolean;
  health_score: number;
  approved_at?: string;
  failure_reason?: string;
  diagnosis: Record<string, any>;
  
  // Fields that were missing and causing TypeScript errors
  metrics_target: Record<string, any>;
  metrics_baseline?: Record<string, any>;
  version: string | number;
  reason_for_recommendation: string;
  target_audience: string;
  goals: string[];
  channels: string[];
  kpis: string[];
  industry: string;
  confidence?: number;
  impact_score?: number;
  is_public?: boolean;
}

// Helper function to convert Json type to Strategy type
export function mapJsonToStrategy(data: any): Strategy {
  return {
    ...data,
    diagnosis: typeof data.diagnosis === 'string' 
      ? JSON.parse(data.diagnosis) 
      : data.diagnosis || {},
    tags: data.tags || [],
    goals: data.goals || [],
    channels: data.channels || [],
    kpis: data.kpis || [],
    updated_at: data.updated_at || data.created_at,
    metrics_target: data.metrics_target || {},
    metrics_baseline: data.metrics_baseline || {},
    version: data.version || '1',
    reason_for_recommendation: data.reason_for_recommendation || '',
    target_audience: data.target_audience || '',
    industry: data.industry || '',
    generated_by: data.generated_by || 'CEO Agent',
    assigned_agent: data.assigned_agent || '',
  };
}

export function mapStrategyArray(data: any[]): Strategy[] {
  return data.map(mapJsonToStrategy);
}

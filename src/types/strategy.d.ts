
import { Json } from '@/integrations/supabase/types';

export type StrategyStatus = 'draft' | 'pending' | 'approved' | 'rejected';

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
  
  // Extended fields
  version?: string;
  reason_for_recommendation?: string;
  target_audience?: string;
  goals?: string[];
  channels?: string[];
  kpis?: string[];
  industry?: string;
  confidence?: number;
  metrics_target?: Record<string, any>;
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
  };
}

export function mapStrategyArray(data: any[]): Strategy[] {
  return data.map(mapJsonToStrategy);
}


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
  approved_at?: string | null;
  failure_reason?: string | null;
  diagnosis: Record<string, any>;
  
  // Essential fields that were causing TypeScript errors
  metrics_target: Record<string, any>;
  metrics_baseline: Record<string, any>;
  version: string | number;
  reason_for_recommendation: string;
  target_audience: string;
  goals: string[];
  channels: string[];
  kpis: string[];
  industry: string;
  confidence?: number | null;
  impact_score?: number;
  is_public?: boolean;
  goal?: string; // For backward compatibility with older components
}

// Helper function to convert Json type to Strategy type
export function mapJsonToStrategy(data: any): Strategy {
  return {
    ...data,
    id: data.id,
    title: data.title || "",
    description: data.description || "",
    status: data.status || "draft",
    tenant_id: data.tenant_id,
    user_id: data.user_id || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    created_at: data.created_at,
    updated_at: data.updated_at || data.created_at,
    generated_by: data.generated_by || 'CEO Agent',
    assigned_agent: data.assigned_agent || '',
    auto_approved: !!data.auto_approved,
    health_score: data.health_score || 0,
    approved_at: data.approved_at || null,
    failure_reason: data.failure_reason || null,
    diagnosis: typeof data.diagnosis === 'object' ? data.diagnosis : {},
    metrics_target: data.metrics_target || {},
    metrics_baseline: data.metrics_baseline || {},
    version: data.version || '1',
    reason_for_recommendation: data.reason_for_recommendation || '',
    target_audience: data.target_audience || '',
    goals: Array.isArray(data.goals) ? data.goals : [],
    channels: Array.isArray(data.channels) ? data.channels : [],
    kpis: Array.isArray(data.kpis) ? data.kpis : [],
    industry: data.industry || '',
    confidence: data.confidence || null,
    impact_score: data.impact_score || 0,
    is_public: !!data.is_public,
    goal: data.goal || '' // For backward compatibility
  };
}

export function mapStrategyArray(data: any[]): Strategy[] {
  return (data || []).map(mapJsonToStrategy);
}

// Strategy version type
export interface StrategyVersion {
  id: string;
  strategy_id: string;
  version: number;
  data: Strategy;
  created_by: string;
  created_at: string;
  comment?: string;
}

// CheckResult interface for launch readiness
export interface CheckResult {
  name: string;
  description: string;
  passed: boolean;
  details?: string;
}

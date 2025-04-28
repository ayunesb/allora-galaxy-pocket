
import type { Json } from "./supabase";

export type StrategyStatus = 
  | 'draft' 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'archived' 
  | 'active'
  | 'completed';

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
  approved_at: string | null;
  failure_reason: string | null;
  impact_score: number | null;
  health_score: number | null;
  is_public: boolean;
  diagnosis: Record<string, any>;
  metrics_baseline: Record<string, any>;
  metrics_target: Record<string, any>;
  version: string | number;
  reason_for_recommendation: string;
  target_audience: string;
  goals: any[];
  channels: string[];
  kpis: any[];
  
  // Optional fields that might be used in some components but not required everywhere
  industry?: string;
  goal?: string;
  confidence?: number;
  retry_prompt?: string;
  onboarding_data?: Record<string, any>;
}

export interface StrategyFormData {
  title: string;
  description: string;
  goals: string[];
  industry: string;
  target_audience?: string;
  channels?: string[];
}

export interface StrategyFeedback {
  id: string;
  strategy_title: string;
  action: string;
  user_id?: string;
  tenant_id?: string;
  created_at: string;
}

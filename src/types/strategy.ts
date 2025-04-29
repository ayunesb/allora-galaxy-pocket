
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
  health_score: number;
  approved_at?: string | null;
  failure_reason?: string | null;
  diagnosis: Record<string, any>;
  
  // Essential fields used throughout the application
  metrics_target: Record<string, any>;
  metrics_baseline: Record<string, any>;
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

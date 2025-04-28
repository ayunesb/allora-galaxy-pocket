
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
  updated_at: string; // Added missing field
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
  metrics_target: Record<string, any>; // Added missing field
  version: string | number; // Added missing field
  reason_for_recommendation: string; // Added missing field
  target_audience: string; // Added missing field
  goals: any[]; // Added missing field
  channels: string[]; // Added missing field
  kpis: any[]; // Added missing field
  retry_prompt?: string;
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

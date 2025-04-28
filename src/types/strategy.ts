
import { Json } from "./supabase";

export type StrategyStatus = 
  | "draft" 
  | "pending_approval" 
  | "approved" 
  | "rejected" 
  | "in_progress"
  | "completed"
  | "archived"
  | "auto_approved"
  | "pending";

export interface Strategy {
  id: string;
  title: string;
  description: string;
  status: StrategyStatus;
  created_at: string;
  tenant_id: string;
  user_id: string | null;
  tags: string[];
  generated_by: string;
  assigned_agent: string;
  auto_approved: boolean;
  approved_by?: string | null;
  approved_at?: string | null;
  health_score: number;
  metrics_baseline: Record<string, any>;
  metrics_target: Record<string, any>;
  failure_reason?: string;
  diagnosis: Json;
  timeline?: any[];
  feedback?: any[];
  version?: number;
  updated_at?: string;
  reason_for_recommendation?: string;
  target_audience?: string;
  goals?: any[];
  channels?: string[];
  kpis?: any[];
  impact_score?: number;
  is_public?: boolean;
  onboarding_data?: Record<string, any>;
}

export interface StrategyDraft {
  title: string;
  description: string;
  tenant_id: string;
  user_id: string;
  tags: string[];
}

export interface StrategyVersion {
  id: string;
  strategy_id: string;
  version_number: number;
  changes: Record<string, any>;
  created_at: string;
  created_by: string;
  tenant_id: string;
}

export interface StrategyResponse {
  id: string;
  strategy: Strategy;
  message: string;
  success: boolean;
  error?: string;
}

export interface StrategyCampaignMapping {
  strategy_id: string;
  campaign_id: string;
  created_at: string;
}

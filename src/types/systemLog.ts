
// If this file doesn't exist, create it with the SystemLog type definition
import { Json } from "@/integrations/supabase/types";

export interface SystemLog {
  id: string;
  tenant_id: string;
  user_id: string;
  event_type: string;
  message: string;
  meta: Json;
  created_at: string;
  severity: 'low' | 'medium' | 'high' | 'critical'; // Required field
}

export interface SystemLogFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  severity?: string[];
  search?: string;
  limit?: number;
  offset?: number;
}

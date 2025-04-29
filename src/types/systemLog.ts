
import { Json } from "@/integrations/supabase/types";

export type LogSeverity = 'low' | 'medium' | 'high' | 'critical' | 'info' | 'error' | 'warning' | 'success';

export interface SystemLog {
  id: string;
  tenant_id: string;
  user_id: string;
  event_type: string;
  message: string;
  meta: Json;
  created_at: string;
  severity: LogSeverity; // Required field
}

export interface SystemLogFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  severity?: LogSeverity[];
  search?: string;
  limit?: number;
  offset?: number;
}

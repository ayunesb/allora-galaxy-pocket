
import { supabase } from '@/integrations/supabase/client';
import { ExportFilters } from '../types';

export async function fetchSystemLogsData(filters: ExportFilters): Promise<any[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (filters.dateRange || 7));
  
  let query = supabase
    .from("system_logs")
    .select('*')
    .eq("tenant_id", filters.tenantId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });
  
  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }
  
  if (filters.search) {
    query = query.ilike("message", `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching system logs data:", error);
    throw error;
  }
  
  return data || [];
}



import { supabase } from "@/integrations/supabase/client";
import { SystemLog, LogSeverity } from "@/types/systemLog"; 

interface LogSystemEventParams {
  tenant_id: string;
  user_id?: string;
  event_type: string;
  message: string;
  severity: LogSeverity;
  meta?: Record<string, any>;
}

export const logSystemEvent = async ({
  tenant_id,
  user_id,
  event_type,
  message,
  severity,
  meta = {}
}: LogSystemEventParams): Promise<SystemLog | null> => {
  try {
    if (!tenant_id) {
      console.error("Cannot log system event: tenant_id is required");
      return null;
    }
    
    const { data, error } = await supabase
      .from('system_logs')
      .insert({
        tenant_id,
        user_id: user_id || null,
        event_type,
        message,
        severity,
        meta,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error logging system event:", error);
      return null;
    }
    
    return data as unknown as SystemLog;
    
  } catch (err) {
    console.error("Failed to log system event:", err);
    return null;
  }
};

export const getSystemLogs = async (
  tenant_id: string, 
  filters: {
    limit?: number;
    offset?: number;
    eventTypes?: string[];
    severity?: LogSeverity[];
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}
): Promise<SystemLog[]> => {
  try {
    let query = supabase
      .from('system_logs')
      .select('*')
      .eq('tenant_id', tenant_id)
      .order('created_at', { ascending: false });
      
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    if (filters.eventTypes && filters.eventTypes.length > 0) {
      query = query.in('event_type', filters.eventTypes);
    }
    
    if (filters.severity && filters.severity.length > 0) {
      query = query.in('severity', filters.severity);
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    
    if (filters.search) {
      query = query.ilike('message', `%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching system logs:", error);
      return [];
    }
    
    // Cast safely to avoid deep recursion
    const safeData = data as unknown as SystemLog[];
    
    // Transform data to ensure it has the severity field
    return safeData.map(log => ({
      ...log,
      severity: log.severity || 'low' // Default severity if missing
    }));
    
  } catch (err) {
    console.error("Failed to fetch system logs:", err);
    return [];
  }
};

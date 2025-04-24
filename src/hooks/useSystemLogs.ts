
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { useQuery } from "@tanstack/react-query";
import type { SystemLog } from "@/types/systemLog";

interface LogInput {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
}

export function useSystemLogs() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  
  // Fetch logs
  const { data: fetchedLogs } = useQuery({
    queryKey: ['system-logs', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (error) throw error;
      return data as SystemLog[];
    },
    enabled: !!tenant?.id,
  });

  useEffect(() => {
    if (fetchedLogs) {
      setLogs(fetchedLogs);
    }
  }, [fetchedLogs]);

  const logActivity = async (input: LogInput) => {
    if (!tenant?.id || isLogging) return false;
    
    setIsLogging(true);
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          user_id: user?.id,
          event_type: input.event_type,
          message: input.message,
          meta: input.meta || {}
        });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error logging activity:", error);
      return false;
    } finally {
      setIsLogging(false);
    }
  };

  const getRecentLogs = async (limit = 50) => {
    if (!tenant?.id) return [];
    
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (error) throw error;
      setLogs(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching logs:", error);
      return [];
    }
  };

  return {
    logs,
    logActivity,
    getRecentLogs,
    isLogging
  };
}

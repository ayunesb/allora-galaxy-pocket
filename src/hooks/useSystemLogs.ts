
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import type { SystemLog, LogActivityParams } from "@/types/systemLog";

export function useSystemLogs() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogging, setIsLogging] = useState(false);

  useEffect(() => {
    if (!tenant?.id) {
      setLogs([]);
      setIsLoading(false);
      return;
    }

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('system_logs')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching system logs:', error);
        setLogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [tenant?.id]);

  const logActivity = async (input: LogActivityParams) => {
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
    
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logs,
    isLoading,
    logActivity,
    getRecentLogs,
    isLogging
  };
}

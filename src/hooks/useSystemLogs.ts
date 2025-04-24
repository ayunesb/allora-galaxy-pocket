
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { SystemLog } from "@/types/logs";

export function useSystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getRecentLogs = async (limit = 100) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error("Error fetching system logs:", error);
      toast.error("Failed to fetch system logs", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSecurityLogs = async (limit = 50) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .like('event_type', '%SECURITY%')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      console.error("Error fetching security logs:", error);
      toast.error("Failed to fetch security logs");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logs,
    isLoading,
    getRecentLogs,
    getSecurityLogs
  };
}

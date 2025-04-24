
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export function useSystemLogs() {
  const { tenant } = useTenant();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return { logs, isLoading };
}

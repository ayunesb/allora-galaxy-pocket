
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { SystemLog } from '@/types/systemLog';
import { toast } from "sonner";

export function useSystemLogsState() {
  const { tenant } = useTenant();
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const getRecentLogs = async (limit = 50): Promise<void> => {
    if (!tenant?.id) {
      console.warn("Can't fetch logs: No tenant ID available");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(limit);
        
      if (fetchError) throw fetchError;
      
      setLogs(data || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError(err);
      toast.error("Failed to retrieve system logs");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch logs on component mount
  useEffect(() => {
    if (tenant?.id) {
      getRecentLogs();
    }
  }, [tenant?.id]);

  return {
    logs,
    isLoading,
    error,
    getRecentLogs
  };
}

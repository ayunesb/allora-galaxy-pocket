
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemLog } from '@/types/systemLog';
import { useTenant } from './useTenant';

interface LogActivityParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
}

interface UseSystemLogsReturn {
  logs: SystemLog[];
  isLoading: boolean;
  error: Error | null;
  getRecentLogs: (limit?: number) => Promise<void>;
  logActivity: (params: LogActivityParams) => Promise<void>;
}

export function useSystemLogs(): UseSystemLogsReturn {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { tenant } = useTenant();

  const getRecentLogs = useCallback(async (limit = 100) => {
    if (!tenant?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching system logs:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch system logs'));
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id]);

  const logActivity = useCallback(async ({ event_type, message, meta }: LogActivityParams) => {
    if (!tenant?.id) {
      console.warn('Cannot log activity: No tenant ID available');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          event_type,
          message,
          meta: meta || {},
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
    } catch (err) {
      console.error('Error logging activity:', err);
      throw err;
    }
  }, [tenant?.id]);

  return {
    logs,
    isLoading,
    error,
    getRecentLogs,
    logActivity
  };
}

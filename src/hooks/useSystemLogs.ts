
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import type { SystemLog, SystemLogFilter, LogActivityParams } from "@/types/systemLog";

export function useSystemLogs() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<SystemLogFilter>({
    dateRange: 7,
    eventType: undefined,
    userId: undefined,
    search: undefined
  });

  // Query for fetching logs with filters
  const {
    data: logs,
    isLoading,
    error
  } = useQuery({
    queryKey: ['system_logs', tenant?.id, filters],
    queryFn: async () => {
      if (!tenant?.id) return [];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (filters.dateRange || 7));

      let query = supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.search) {
        query = query.ilike('message', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return (data as SystemLog[]) || [];
    },
    enabled: !!tenant?.id
  });

  // Mutation for logging new activities
  const logActivity = useMutation({
    mutationFn: async ({ event_type, message, meta = {} }: LogActivityParams) => {
      if (!tenant?.id || !user?.id) return null;

      const { data, error } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          user_id: user.id,
          event_type,
          message,
          meta
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system_logs'] });
    }
  });

  return {
    logs: logs || [],
    isLoading,
    error,
    filters,
    setFilters,
    logActivity: logActivity.mutate
  };
}

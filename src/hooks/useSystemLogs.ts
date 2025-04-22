
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";

interface LogActivityParams {
  event_type: string;
  message: string;
  meta?: Record<string, any>;
}

export function useSystemLogs() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
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
      // Invalidate relevant queries when a new log is added
      queryClient.invalidateQueries({ queryKey: ['system_logs'] });
    }
  });

  return {
    logActivity: logActivity.mutate,
    isLogging: logActivity.isPending
  };
}

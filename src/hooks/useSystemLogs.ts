
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

interface FetchLogsParams {
  dateRange?: number;
  actionType?: string;
  userId?: string;
  search?: string;
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

  const fetchLogs = useQuery({
    queryKey: ['system_logs', tenant?.id],
    queryFn: async ({ queryKey, signal }) => {
      const [_, tenantId] = queryKey as [string, string];
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!tenant?.id
  });

  // Function to fetch logs with filters
  const fetchFilteredLogs = async ({
    dateRange = 7,
    actionType,
    userId,
    search
  }: FetchLogsParams = {}) => {
    if (!tenant?.id) return [];
    
    // Calculate start date based on dateRange
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    // Build query
    let query = supabase
      .from("system_logs")
      .select('*')
      .eq("tenant_id", tenant.id)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });
    
    // Apply filters
    if (actionType && actionType !== "all") {
      query = query.eq("event_type", actionType);
    }
    
    if (userId && userId !== "all") {
      query = query.eq("user_id", userId);
    }
    
    if (search) {
      query = query.ilike("message", `%${search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching filtered logs:", error);
      throw error;
    }
    
    return data || [];
  };

  return {
    logActivity: logActivity.mutate,
    isLogging: logActivity.isPending,
    logs: fetchLogs.data || [],
    isLoadingLogs: fetchLogs.isLoading,
    logsError: fetchLogs.error,
    fetchFilteredLogs
  };
}

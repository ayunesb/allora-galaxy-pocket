
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";

interface AssistantLogEntry {
  id?: string;
  tenant_id: string;
  user_id: string;
  agent_id?: string | null;
  command: string;
  response: string;
  created_at?: string;
}

export function useAssistantLogs() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const createLog = useMutation({
    mutationFn: async (log: Omit<AssistantLogEntry, 'tenant_id' | 'user_id'>) => {
      if (!tenant?.id || !user?.id) throw new Error("User or tenant not found");
      
      const newLog = {
        ...log,
        tenant_id: tenant.id,
        user_id: user.id,
      };
      
      const { data, error } = await supabase
        .from('assistant_logs')
        .insert(newLog)
        .select()
        .single();
        
      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-logs'] });
    },
  });
  
  const fetchLogs = useQuery({
    queryKey: ['assistant-logs', tenant?.id, user?.id],
    queryFn: async () => {
      if (!tenant?.id || !user?.id) return [];
      
      const { data, error } = await supabase
        .from('assistant_logs')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      return data || [];
    },
    enabled: !!tenant?.id && !!user?.id,
  });
  
  return {
    logs: fetchLogs.data || [],
    isLoading: fetchLogs.isLoading,
    createLog: createLog.mutate,
    isCreating: createLog.isPending,
  };
}

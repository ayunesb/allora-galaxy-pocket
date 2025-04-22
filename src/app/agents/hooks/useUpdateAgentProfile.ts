
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { type AgentProfile } from "./useAgentProfile";
import { logNotification } from "@/lib/notifications/logNotification";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export function useUpdateAgentProfile() {
  const queryClient = useQueryClient();
  const { logActivity } = useSystemLogs();

  return useMutation({
    mutationFn: async (data: Partial<AgentProfile>) => {
      const { error } = await supabase
        .from("agent_profiles")
        .upsert(data, { onConflict: "tenant_id" });

      if (error) throw error;

      // Log to system logs
      await logActivity.mutate({
        event_type: "agent_profile_updated",
        message: `Agent profile updated for ${data.agent_name}`,
        meta: { agent_name: data.agent_name }
      });

      // Post notification
      await logNotification({
        tenant_id: data.tenant_id!,
        event_type: "agent_profile_updated",
        description: `Agent ${data.agent_name} profile has been updated`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-profile"] });
    },
  });
}

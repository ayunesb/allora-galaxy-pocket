
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateAgentProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("agent_profiles")
        .upsert(data, { onConflict: "tenant_id" });

      if (error) throw error;

      // Log the change
      await supabase.from("system_logs").insert({
        event_type: "agent_profile_updated",
        message: `Agent profile updated for ${data.agent_name}`,
        tenant_id: data.tenant_id,
        meta: { agent_name: data.agent_name }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-profile"] });
    },
  });
}

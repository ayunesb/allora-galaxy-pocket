
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";

export function usePromptVersioning(agentName: string) {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch prompt versions (history)
  const { data: versions = [], isLoading } = useQuery({
    queryKey: ["prompt-versions", agentName, tenant?.id],
    enabled: !!agentName && !!tenant?.id,
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from("agent_prompt_versions")
        .select("*")
        .eq("agent_name", agentName)
        .eq("tenant_id", tenant.id)
        .order("version", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  // Save new prompt version
  const { mutateAsync: savePromptVersion, isPending: isSaving } = useMutation({
    mutationFn: async ({ prompt }: { prompt: string }) => {
      if (!tenant?.id || !user?.id) throw new Error("Missing tenant or user id");
      // Get latest version
      const { data: latest, error: vError } = await supabase
        .from("agent_prompt_versions")
        .select("version")
        .eq("agent_name", agentName)
        .eq("tenant_id", tenant.id)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (vError) throw vError;
      const newVersion = (latest?.version || 0) + 1;

      // Insert new version
      const { error: insertErr } = await supabase.from("agent_prompt_versions").insert({
        agent_name: agentName,
        prompt,
        version: newVersion,
        edited_by: user.id,
        tenant_id: tenant.id,
      });
      if (insertErr) throw insertErr;

      // Update blueprint prompt
      const { error: updateErr } = await supabase
        .from("agent_blueprints")
        .update({ prompt })
        .eq("agent_name", agentName)
        .eq("agent_name", agentName); // double check filter
      if (updateErr) throw updateErr;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompt-versions", agentName, tenant?.id] })
  });

  // Restore older version
  const { mutateAsync: restorePromptVersion } = useMutation({
    mutationFn: async (restoreData: { prompt: string; version: number }) => {
      if (!tenant?.id || !user?.id) throw new Error("Missing tenant or user id");
      // Save as a new latest version
      return savePromptVersion({ prompt: restoreData.prompt });
    }
  });

  return {
    versions,
    isLoading,
    savePromptVersion,
    restorePromptVersion,
    isSaving
  };
}

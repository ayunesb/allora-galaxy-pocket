
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";

// NOTE: To generate an explanation for the prompt using OpenAI, it's better handled in an edge function for securely accessing the API key.
// See Lovable's documentation for OpenAI integration via edge functions.
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

  // Save current prompt as new version (no explanation auto-generation here, recommend calling edge-function if desired)
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
      const { data: insertedVersion, error: insertErr } = await supabase
        .from("agent_prompt_versions")
        .insert({
          agent_name: agentName,
          prompt,
          version: newVersion,
          edited_by: user.id,
          tenant_id: tenant.id,
        })
        .select('id')
        .single();
      
      if (insertErr) throw insertErr;

      // Optionally: call edge function to generate explanation automatically (not run here)

      // Update blueprint prompt
      const { error: updateErr } = await supabase
        .from("agent_blueprints")
        .update({ prompt })
        .eq("agent_name", agentName);
      
      if (updateErr) throw updateErr;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompt-versions", agentName, tenant?.id] })
  });

  return {
    versions,
    isLoading,
    savePromptVersion,
    isSaving,
    // generatePromptExplanation: not implemented here, should be on the server/edge-function
  };
}

/**
 * --- Prompt Auto-Switch & Rollback Logic (DOCUMENTATION) ---
 *
 * // To auto-switch (when best version wins by 30% delta):
 * await supabase.from("agent_blueprints").update({
 *   prompt: newPrompt,
 *   last_prompt_id: currentPromptId    // Save old version's ID for rollback
 * }).eq("agent_name", agent);
 *
 * // To rollback (if new version underperforms by >15% but <30%):
 * const { data: oldPrompt } = await supabase.from("agent_prompt_versions")
 *   .select("prompt").eq("id", last_prompt_id).maybeSingle();
 * await supabase.from("agent_blueprints").update({
 *   prompt: oldPrompt.prompt
 * }).eq("agent_name", agent);
 * await supabase.from("agent_alerts").insert({
 *   agent,
 *   alert_type: "rollback",
 *   message: `Auto-switched prompt underperformed. Rolled back.`
 * });
 */


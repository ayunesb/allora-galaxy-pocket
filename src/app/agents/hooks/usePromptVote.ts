
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export function usePromptVote() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  // Insert an agent's vote (+1 or -1) for a prompt version
  const { mutateAsync: voteForPrompt, isPending } = useMutation({
    mutationFn: async ({
      agent_name,
      version,
      voter_agent,
      vote,
    }: {
      agent_name: string;
      version: number;
      voter_agent: string;
      vote: number; // +1 or -1
    }) => {
      if (!tenant?.id) throw new Error("Missing tenant id");
      if (vote !== 1 && vote !== -1) throw new Error("Vote must be +1 or -1");
      const { error } = await supabase.from("agent_prompt_votes").insert({
        agent_name,
        version,
        voter_agent,
        vote,
        tenant_id: tenant.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agent-prompt-votes"] });
    },
  });

  return { voteForPrompt, isPending };
}

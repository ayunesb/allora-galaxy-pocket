
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AgentFeedback } from "@/types/agent";

export function useAgentFeedback() {
  const { data: feedback = [], isLoading, error } = useQuery({
    queryKey: ["agent-feedback"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AgentFeedback[];
    },
  });

  const getTunedPrompt = async (tenantId: string) => {
    try {
      const { data: recentFeedback } = await supabase
        .from("agent_feedback")
        .select("feedback, rating")
        .eq("to_agent", "CEO Agent")
        .order("created_at", { ascending: false })
        .limit(3);

      const summary = (recentFeedback || [])
        .map((f) => `• [${f.rating}/5] ${f.feedback}`)
        .join("\n");

      return `
You are the CEO Agent. Here is recent feedback on your past strategies:

${summary || "No feedback yet."}

Now generate a new strategy for this tenant based on their goals.
`;
    } catch (error) {
      console.error("Error fetching agent feedback:", error);
      return `You are the CEO Agent. Generate a new strategy for this tenant based on their goals.`;
    }
  };

  return {
    feedback,
    isLoading,
    error,
    getTunedPrompt,
  };
}

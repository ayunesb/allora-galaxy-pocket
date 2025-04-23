
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AgentFeedback {
  id: string;
  from_agent: string;
  to_agent: string;
  strategy_id: string;
  feedback: string;
  rating: number;
  created_at: string;
}

export function useAgentFeedback() {
  const { data: feedback = [], isLoading } = useQuery({
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
  };

  return {
    feedback,
    isLoading,
    getTunedPrompt,
  };
}


import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { AgentFeedback } from "@/types/agent";
import { toast } from "sonner";

export function useAgentFeedback() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<AgentFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();

  const getFeedback = useCallback(async (agent: string) => {
    if (!tenant?.id) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("agent_feedback")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("agent", agent)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Explicitly cast the data to AgentFeedback[]
      const typedFeedback = data as AgentFeedback[];
      setFeedback(typedFeedback);
      return typedFeedback;
    } catch (error) {
      console.error("Error fetching agent feedback:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [tenant?.id]);

  const submitFeedback = useCallback(async (feedbackData: Partial<AgentFeedback>) => {
    if (!tenant?.id) {
      toast.error("No active workspace");
      return false;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("agent_feedback")
        .insert({
          ...feedbackData,
          tenant_id: tenant.id,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success("Feedback submitted successfully");
      return true;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [tenant?.id]);

  return {
    feedback,
    isLoading,
    isSubmitting,
    getFeedback,
    submitFeedback
  };
}

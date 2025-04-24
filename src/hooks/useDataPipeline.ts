
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { toast } from "sonner";

interface PipelineEvent {
  event_type: string;
  source: string;
  target: string;
  metadata?: Record<string, any>;
}

export function useDataPipeline() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const logPipelineEvent = useMutation({
    mutationFn: async (event: PipelineEvent) => {
      if (!tenant?.id) throw new Error("No tenant selected");

      const { error } = await supabase
        .from("data_pipeline_events")
        .insert({
          tenant_id: tenant.id,
          event_type: event.event_type,
          source: event.source,
          target: event.target,
          metadata: event.metadata || {},
        });

      if (error) throw error;
    },
    onError: (error) => {
      console.error("Pipeline event logging failed:", error);
      toast.error("Failed to track pipeline event");
    }
  });

  const { data: pipelineMetrics } = useQuery({
    queryKey: ["pipeline-metrics", tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;

      const { data, error } = await supabase
        .from("kpi_calculations")
        .select("*")
        .eq("tenant_id", tenant.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  return {
    logPipelineEvent: logPipelineEvent.mutate,
    pipelineMetrics,
    isLoading: logPipelineEvent.isPending
  };
}

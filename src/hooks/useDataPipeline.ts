
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { toast } from "sonner";

interface PipelineEvent {
  event_type: string;
  source: string;
  target: string;
  metadata?: Record<string, any>;
}

interface PipelineResponse {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Hook for logging data pipeline events and activities
 */
export function useDataPipeline() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();

  const logPipelineEvent = async (event: PipelineEvent): Promise<PipelineResponse> => {
    if (!tenant?.id) {
      return {
        success: false,
        error: "No active tenant"
      };
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("data_pipeline_events").insert({
        tenant_id: tenant.id,
        event_type: event.event_type,
        source: event.source,
        target: event.target,
        metadata: event.metadata || {},
        status: "completed"
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Pipeline event logging error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error logging pipeline event"
      };
    } finally {
      setIsLoading(false);
    }
  };

  const trackMetric = async (
    metricName: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<PipelineResponse> => {
    if (!tenant?.id) {
      return {
        success: false,
        error: "No active tenant"
      };
    }

    try {
      const { error } = await supabase.from("system_metrics").insert({
        tenant_id: tenant.id,
        metric_name: metricName,
        value,
        metadata: metadata || {}
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Metric tracking error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error tracking metric"
      };
    }
  };

  return {
    logPipelineEvent,
    trackMetric,
    isLoading
  };
}


import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

interface PipelineEventData {
  event_type: string;
  source: string;
  target: string;
  metadata?: Record<string, any>;
}

export function useDataPipeline() {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logPipelineEvent = async (eventData: PipelineEventData): Promise<string | null> => {
    if (!tenant?.id) {
      setError("No active workspace found");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase.from('data_pipeline_events').insert({
        tenant_id: tenant.id,
        event_type: eventData.event_type,
        source: eventData.source,
        target: eventData.target,
        metadata: eventData.metadata || {}
      }).select('id').single();

      if (insertError) throw insertError;

      return data.id;
    } catch (err: any) {
      console.error("Error logging pipeline event:", err);
      setError(err.message || "Failed to log pipeline event");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logPipelineEvent,
    isLoading,
    error
  };
}

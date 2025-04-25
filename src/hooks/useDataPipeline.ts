
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

interface PipelineEvent {
  event_type: string;
  source: string;
  target: string;
  metadata?: Record<string, any>;
}

export function useDataPipeline() {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const logPipelineEvent = async (event: PipelineEvent) => {
    if (!tenant?.id) {
      console.error("Cannot log pipeline event: No tenant ID available");
      return {
        success: false,
        error: "No tenant ID available"
      };
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from("data_pipeline_events")
        .insert({
          tenant_id: tenant.id,
          event_type: event.event_type,
          source: event.source,
          target: event.target,
          metadata: event.metadata || {}
        });
        
      if (error) throw error;
      
      return { success: true };
    } catch (err: any) {
      console.error("Pipeline event error:", err);
      setError(err.message || "Failed to log pipeline event");
      return {
        success: false,
        error: err.message
      };
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

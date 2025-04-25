
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { ToastService } from '@/services/ToastService';

interface PipelineEvent {
  event_type: string;
  source: string;
  target: string;
  metadata?: Record<string, any>;
}

export function useDataPipeline() {
  const { tenant } = useTenant();

  const logPipelineEvent = async (event: PipelineEvent) => {
    if (!tenant?.id) {
      console.warn("Cannot log pipeline event: No tenant ID");
      return false;
    }

    try {
      const { error } = await supabase.rpc('log_pipeline_event', {
        p_tenant_id: tenant.id,
        p_event_type: event.event_type,
        p_source: event.source,
        p_target: event.target,
        p_metadata: event.metadata || {}
      });

      if (error) {
        console.error("Failed to log pipeline event:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error in pipeline event logging:", err);
      return false;
    }
  };

  const trackUserJourney = async (from: string, to: string, details: Record<string, any> = {}) => {
    return logPipelineEvent({
      event_type: 'user_journey',
      source: from,
      target: to,
      metadata: details
    });
  };

  return {
    logPipelineEvent,
    trackUserJourney
  };
}

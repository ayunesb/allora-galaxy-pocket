
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

interface PipelineEventParams {
  event_type: string;
  source: string;
  target: string;
  metadata?: Record<string, any>;
}

export function useDataPipeline() {
  const { tenant } = useTenant();

  const logPipelineEvent = useCallback(async (params: PipelineEventParams) => {
    if (!tenant?.id) {
      console.warn('Cannot log pipeline event: No tenant ID available');
      return;
    }

    try {
      const { error } = await supabase.rpc('log_pipeline_event', {
        p_tenant_id: tenant.id,
        p_event_type: params.event_type,
        p_source: params.source,
        p_target: params.target,
        p_metadata: params.metadata || {}
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error logging pipeline event:', err);
    }
  }, [tenant?.id]);

  return { logPipelineEvent };
}

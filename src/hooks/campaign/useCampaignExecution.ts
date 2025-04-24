import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { toast } from "sonner";
import { useSystemLogs } from '@/hooks/useSystemLogs';

export function useCampaignExecution() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();

  const execute = async () => {
    try {
      if (!tenant?.id) {
        toast({
          title: "Error",
          description: "No active workspace"
        });
        return;
      }

      setStatus('running');
      setProgress(0);

      // Simulate campaign execution steps
      const totalSteps = 10;
      for (let i = 1; i <= totalSteps; i++) {
        // Simulate a step
        await new Promise(resolve => setTimeout(resolve, 500));

        // Log activity for each step
        await logActivity({
          event_type: 'CAMPAIGN_EXECUTION_STEP',
          message: `Campaign execution step ${i} of ${totalSteps}`,
          meta: {
            step: i,
            total_steps: totalSteps
          }
        });

        const stepProgress = Math.round((i / totalSteps) * 100);
        setProgress(stepProgress);
      }

      setStatus('success');
      setProgress(100);

      toast({
        title: "Success",
        description: "Campaign executed successfully"
      });

      // Log to automation metrics
      await supabase.rpc('log_automation_metric', {
        p_tenant_id: tenant.id,
        p_metric_name: 'campaign_execution',
        p_is_ai: true
      });

    } catch (error) {
      console.error('Campaign execution error:', error);
      toast({
        title: "Error",
        description: "Failed to execute campaign",
        variant: "destructive"
      });
    }
  };

  return {
    execute,
    status,
    progress,
  };
}

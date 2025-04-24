
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { CronJobLog } from "@/types/cron";
import { toast } from "sonner";

export function useCronJobStatus() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['cron-job-status', tenant?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('cron_job_logs')
          .select('*')
          .order('ran_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        return data as CronJobLog[];
      } catch (error: any) {
        toast.error('Failed to fetch automation status', {
          description: error.message || 'An unknown error occurred'
        });
        throw error;
      }
    },
    refetchInterval: 60000, // Refresh every 60 seconds
    retry: 2,
    enabled: !!tenant?.id,
  });
}

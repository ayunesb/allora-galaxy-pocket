
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export function useCronJobStatus() {
  const { tenant } = useTenant();

  return useQuery({
    queryKey: ['cron-job-status', tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cron_job_logs')
        .select('*')
        .order('ran_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id,
  });
}

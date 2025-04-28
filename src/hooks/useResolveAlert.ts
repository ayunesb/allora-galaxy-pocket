
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useResolveAlert() {
  const [isResolving, setIsResolving] = useState(false);

  const resolveAlert = async (alertId: string, resolutionNote: string) => {
    try {
      setIsResolving(true);

      // Since we can't directly use our database function from the client,
      // we'll call a specialized RPC function
      const { data, error } = await supabase.rpc(
        'resolve_kpi_alert',
        {
          alert_id: alertId,
          resolution_note: resolutionNote
        }
      );

      if (error) throw error;

      toast.success('Alert resolved successfully');
      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
      return false;
    } finally {
      setIsResolving(false);
    }
  };

  return {
    resolveAlert,
    isResolving
  };
}

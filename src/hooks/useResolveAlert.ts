
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useResolveAlert() {
  const [isResolving, setIsResolving] = useState(false);
  const { toast } = useToast();

  const resolveAlert = async (alertId: string) => {
    setIsResolving(true);
    try {
      // Using a direct update instead of a custom function
      const { error } = await supabase
        .from('kpi_alerts')
        .update({ 
          status: 'resolved', 
          outcome: 'manually_resolved',
          updated_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;

      toast({
        title: "Alert resolved",
        description: "The alert has been successfully resolved.",
      });

      return true;
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast({
        title: "Failed to resolve alert",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsResolving(false);
    }
  };

  return { resolveAlert, isResolving };
}

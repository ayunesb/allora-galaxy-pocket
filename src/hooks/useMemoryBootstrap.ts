
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/sonner';

export function useMemoryBootstrap() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { user } = useAuth();

  const bootstrapMemory = async () => {
    if (!tenant?.id || !user?.id) {
      toast.error('Authentication required');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('memory-bootstrap', {
        body: {
          tenant_id: tenant.id,
          user_id: user.id
        }
      });

      if (error) throw error;
      
      toast.success('AI memory initialized');
    } catch (error) {
      console.error('Memory bootstrap error:', error);
      toast.error('Failed to initialize AI memory');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { bootstrapMemory, isLoading };
}

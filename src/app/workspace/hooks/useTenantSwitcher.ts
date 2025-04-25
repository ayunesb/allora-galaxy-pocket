
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTenant } from '@/hooks/useTenant';
import { Tenant } from '@/types/tenant';

export function useTenantSwitcher() {
  const [isChanging, setIsChanging] = useState(false);
  const { tenant, setTenant } = useTenant();
  const { toast } = useToast();

  const switchTenant = useCallback(async (newTenant: Tenant) => {
    try {
      setIsChanging(true);
      
      // Set the new tenant in the context
      setTenant(newTenant);
      
      toast({
        title: "Workspace changed",
        description: `Now working in "${newTenant.name}"`
      });

      return true;
    } catch (error: any) {
      console.error("Error switching tenant:", error);
      
      toast({
        title: "Error changing workspace",
        description: error.message || "Failed to change workspace",
        variant: "destructive"
      });
      
      return false;
    } finally {
      setIsChanging(false);
    }
  }, [setTenant, toast]);

  return {
    currentTenant: tenant,
    isChanging,
    switchTenant
  };
}

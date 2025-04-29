
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { useTenant } from './useTenant';
import { supabase } from '@/integrations/supabase/client';

export function useDemoRestrictions() {
  const { toast } = useToast();
  const { tenant } = useTenant();
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetTime, setLastResetTime] = useState<Date | null>(null);

  const isDemoTenant = !!tenant?.id && tenant.id.includes('demo');
  const isDemoMode = isDemoTenant; // Alias for backward compatibility

  useEffect(() => {
    // Load last reset time from localStorage
    const storedTime = localStorage.getItem(`demo_reset_${tenant?.id}`);
    if (storedTime) {
      setLastResetTime(new Date(storedTime));
    }
  }, [tenant?.id]);

  const checkAccess = (action: string): boolean => {
    if (!isDemoTenant) return true;
    
    // Define specific restrictions for demo tenants
    const restrictedActions = ['delete', 'modify_billing', 'advanced_settings'];
    
    return !restrictedActions.includes(action);
  };

  const showRestrictionWarning = (action: string) => {
    toast({
      title: "Demo Restriction",
      description: `This action (${action}) is restricted in demo mode.`,
      variant: "destructive"
    });
  };

  const resetDemo = async () => {
    if (!isDemoTenant) return;
    
    setIsResetting(true);
    try {
      // Call the reset demo function or edge function
      const { error } = await supabase.functions.invoke('reset-demo-tenant', { 
        body: { tenant_id: tenant?.id }
      });
      
      if (error) throw error;
      
      // Update the last reset time
      const now = new Date();
      setLastResetTime(now);
      localStorage.setItem(`demo_reset_${tenant?.id}`, now.toISOString());
      
      toast({
        title: "Demo Reset Complete",
        description: "The demo environment has been reset to its initial state.",
      });
      
      // Reload the page to refresh all data
      window.location.reload();
    } catch (error) {
      console.error("Failed to reset demo:", error);
      toast({
        title: "Demo Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset demo environment",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  return { 
    isDemoTenant, 
    isDemoMode,
    checkAccess, 
    showRestrictionWarning,
    resetDemo,
    isResetting,
    lastResetTime
  };
}

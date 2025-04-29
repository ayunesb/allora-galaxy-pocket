
import { useTenant } from './useTenant';
import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

export function useDemoRestrictions() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [restrictedFeatures, setRestrictedFeatures] = useState<string[]>([]);
  const [isResetting, setIsResetting] = useState(false);
  const [lastResetTime, setLastResetTime] = useState<Date | null>(null);

  useEffect(() => {
    if (tenant) {
      setIsDemoMode(!!tenant.is_demo);
      
      // Define restricted features for demo mode
      if (tenant.is_demo) {
        setRestrictedFeatures([
          'billing',
          'export',
          'admin',
          'settings',
          'delete'
        ]);
      } else {
        setRestrictedFeatures([]);
      }
    }
  }, [tenant]);

  const checkAccess = (feature: string): boolean => {
    if (!isDemoMode) return true;
    return !restrictedFeatures.includes(feature);
  };

  const showRestrictionWarning = (feature: string): void => {
    toast({
      title: "Demo Restriction",
      description: `This ${feature} feature is restricted in demo mode.`,
      variant: "destructive",
    });
  };

  const resetDemo = async (): Promise<boolean> => {
    if (!isDemoMode) return false;
    
    setIsResetting(true);
    
    try {
      // Reset demo data logic would go here
      
      // Update the last reset time
      setLastResetTime(new Date());
      
      toast({
        title: "Demo Reset",
        description: "The demo has been reset successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error resetting demo:", error);
      
      toast({
        title: "Reset Failed",
        description: "There was a problem resetting the demo.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsResetting(false);
    }
  };

  return {
    isDemoMode,
    restrictedFeatures,
    checkAccess,
    showRestrictionWarning,
    resetDemo,
    isResetting,
    lastResetTime
  };
}


import { useTenant } from './useTenant';
import { useEffect, useState } from 'react';
import { useToast } from './use-toast';

export function useDemoRestrictions() {
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [restrictedFeatures, setRestrictedFeatures] = useState<string[]>([]);

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

  return {
    isDemoMode,
    restrictedFeatures,
    checkAccess,
    showRestrictionWarning
  };
}

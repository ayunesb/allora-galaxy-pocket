
import { useToast } from './use-toast';
import { useTenant } from './useTenant';

export function useDemoRestrictions() {
  const { toast } = useToast();
  const { tenant } = useTenant();

  const isDemoTenant = !!tenant?.id && tenant.id.includes('demo');

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

  return { 
    isDemoTenant, 
    checkAccess, 
    showRestrictionWarning 
  };
}

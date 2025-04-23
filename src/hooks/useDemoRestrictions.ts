
import { useTenant } from "@/hooks/useTenant";
import { useToast } from "@/hooks/use-toast";

export function useDemoRestrictions() {
  const { tenant } = useTenant();
  const { toast } = useToast();

  const isDemoMode = tenant?.is_demo ?? false;

  const restrictDemoAction = (action: string): boolean => {
    if (isDemoMode) {
      toast({
        title: "Demo Mode Restriction",
        description: `This action (${action}) is not available in demo mode`,
        variant: "warning"
      });
      return true;
    }
    return false;
  };

  return {
    isDemoMode,
    restrictDemoAction
  };
}

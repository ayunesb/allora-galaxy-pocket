
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { useKpiAlerts } from "@/hooks/useKpiAlerts";
import { Loader2 } from "lucide-react";

interface KpiCampaignTrackerProps {
  interval?: number; // in milliseconds
  onUpdate?: () => void;
  showNotifications?: boolean;
}

export function KpiCampaignTracker({ 
  interval = 60000 * 15, // Default: check every 15 minutes 
  onUpdate,
  showNotifications = false
}: KpiCampaignTrackerProps) {
  const { tenant } = useTenant();
  const [isChecking, setIsChecking] = useState(false);
  const { triggerKpiCheck } = useKpiAlerts();
  
  const checkKpis = async () => {
    if (!tenant?.id || isChecking) return;
    
    try {
      setIsChecking(true);
      await triggerKpiCheck(tenant.id);
      
      // Optionally notify parent component of successful update
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error("Error checking KPI alerts:", error);
    } finally {
      setIsChecking(false);
    }
  };
  
  // Run a check on component mount and then on interval
  useEffect(() => {
    if (!tenant?.id) return;
    
    // Initial check
    checkKpis();
    
    // Set up interval for periodic checking
    const timer = setInterval(checkKpis, interval);
    
    return () => clearInterval(timer);
  }, [tenant?.id, interval]);
  
  // Force check KPI alerts
  const forceCheck = async () => {
    try {
      await checkKpis();
      if (showNotifications) {
        toast.success("KPI check completed");
      }
    } catch (error) {
      if (showNotifications) {
        toast.error("Failed to check KPIs");
      }
    }
  };
  
  // This component doesn't render anything visible by default unless showNotifications is true
  if (showNotifications && isChecking) {
    return (
      <div className="fixed bottom-4 right-4 bg-background border border-border rounded-md p-2 shadow-md flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking KPIs...</span>
      </div>
    );
  }
  
  return null;
}

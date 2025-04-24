
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface KpiCampaignTrackerProps {
  interval?: number; // in milliseconds
  onUpdate?: () => void;
}

export function KpiCampaignTracker({ 
  interval = 60000 * 15, // Default: check every 15 minutes 
  onUpdate 
}: KpiCampaignTrackerProps) {
  const { tenant } = useTenant();
  const [isChecking, setIsChecking] = useState(false);
  
  const checkKpis = async () => {
    if (!tenant?.id || isChecking) return;
    
    try {
      setIsChecking(true);
      const { error } = await supabase.functions.invoke('check-kpi-alerts', {
        body: { tenant_id: tenant.id }
      });
      
      if (error) throw error;
      
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
      toast.success("KPI check completed");
    } catch (error) {
      toast.error("Failed to check KPIs");
    }
  };
  
  // This component doesn't render anything visible by default
  return null;
}

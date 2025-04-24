
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useKpiAlerts() {
  const [isLoading, setIsLoading] = useState(false);
  
  const triggerKpiCheck = async (tenantId: string) => {
    if (!tenantId) {
      toast.error("No tenant ID provided");
      return false;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke("kpi-alerts", {
        body: { tenant_id: tenantId }
      });
      
      if (error) throw error;
      
      return true;
    } catch (err) {
      console.error("Error checking KPI alerts:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    triggerKpiCheck,
    isLoading
  };
}

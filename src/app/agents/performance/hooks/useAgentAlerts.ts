
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

export function useAgentAlerts() {
  const { tenant } = useTenant();
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!tenant?.id) return;

      const { data } = await supabase
        .from("agent_alerts")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("alert_type", "prompt-switch-recommendation")
        .order("triggered_at", { ascending: false });

      if (data) {
        setAlerts(data);
      }
    };

    fetchAlerts();
  }, [tenant?.id]);

  return alerts;
}

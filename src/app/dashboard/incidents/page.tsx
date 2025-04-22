
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import IncidentFilters from "./IncidentFilters";
import IncidentListItem from "./IncidentListItem";

type AgentAlert = {
  id: string;
  tenant_id: string;
  agent: string;
  alert_type: string;
  message: string;
  triggered_at: string;
  strategy_id?: string;
  status: string;
};

export default function IncidentTimeline() {
  const { tenant } = useTenant();
  const [alerts, setAlerts] = useState<AgentAlert[]>([]);
  const [filters, setFilters] = useState<{ agent?: string; alertType?: string }>({});

  useEffect(() => {
    if (!tenant?.id) return;

    let query = supabase
      .from("agent_alerts")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("triggered_at", { ascending: false });

    if (filters.agent) {
      query = query.eq("agent", filters.agent);
    }
    if (filters.alertType) {
      query = query.eq("alert_type", filters.alertType);
    }

    query.then(({ data }) => setAlerts(data || []));
  }, [tenant?.id, filters]);

  const uniqueAgents = [...new Set(alerts.map((a) => a.agent))];
  const uniqueAlertTypes = [...new Set(alerts.map((a) => a.alert_type))];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">📅 AI Incident Timeline</h1>

      <IncidentFilters
        agents={uniqueAgents}
        alertTypes={uniqueAlertTypes}
        filters={filters}
        setFilters={setFilters}
      />

      <ul className="border-l-2 border-primary pl-4">
        {alerts.map((a) => (
          <IncidentListItem key={a.id} alert={a} />
        ))}
      </ul>
    </div>
  );
}

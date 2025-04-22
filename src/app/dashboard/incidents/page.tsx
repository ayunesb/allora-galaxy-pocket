
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import IncidentFilters from "./IncidentFilters";
import IncidentListItem from "./IncidentListItem";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenant?.id) return;
    
    setLoading(true);
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

    query.then(({ data, error }) => {
      if (error) {
        console.error("Error fetching alerts:", error);
      } else {
        setAlerts(data || []);
      }
      setLoading(false);
    });
  }, [tenant?.id, filters]);

  const uniqueAgents = [...new Set(alerts.map((a) => a.agent))];
  const uniqueAlertTypes = [...new Set(alerts.map((a) => a.alert_type))];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">📅 AI Incident Timeline</h1>
        <Link to="/recovery">
          <Button variant="outline" className="gap-2">
            <span>View Recovery Strategies</span>
          </Button>
        </Link>
      </div>

      <IncidentFilters
        agents={uniqueAgents}
        alertTypes={uniqueAlertTypes}
        filters={filters}
        setFilters={setFilters}
      />

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-pulse text-muted-foreground">Loading incidents...</div>
        </div>
      ) : alerts.length > 0 ? (
        <ul className="border-l-2 border-primary pl-4">
          {alerts.map((a) => (
            <IncidentListItem key={a.id} alert={a} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No incidents found. That's a good thing!
        </div>
      )}
    </div>
  );
}

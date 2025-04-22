
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import IncidentFilters from "./IncidentFilters";
import IncidentListItem from "./IncidentListItem";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenant?.id) return;
    
    setLoading(true);
    setError(null);

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
        setError(error.message);
      } else {
        setAlerts(data || []);
      }
      setLoading(false);
    });
  }, [tenant?.id, filters]);

  const uniqueAgents = [...new Set(alerts.map((a) => a.agent))];
  const uniqueAlertTypes = [...new Set(alerts.map((a) => a.alert_type))];

  if (!tenant?.id) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Please select a workspace to view incidents.</p>
      </div>
    );
  }

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
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <div className="text-muted-foreground">Loading incidents...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setFilters({});
              // Re-trigger the effect
              setLoading(true);
            }}
            className="mt-4"
          >
            Reset filters
          </Button>
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

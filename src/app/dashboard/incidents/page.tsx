
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";

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
  const [filters, setFilters] = useState<{agent?: string; alertType?: string}>({});

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

  const getAlertIcon = (status: string) => {
    switch(status) {
      case 'resolved': return <CheckCircle2 className="text-green-500" />;
      case 'in_progress': return <AlertCircle className="text-yellow-500" />;
      case 'unresolved': return <XCircle className="text-red-500" />;
      default: return null;
    }
  };

  const uniqueAgents = [...new Set(alerts.map(a => a.agent))];
  const uniqueAlertTypes = [...new Set(alerts.map(a => a.alert_type))];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">📅 AI Incident Timeline</h1>
      
      <div className="flex space-x-2 mb-4">
        <select 
          className="border p-2 rounded"
          onChange={(e) => setFilters(prev => ({...prev, agent: e.target.value || undefined}))}
        >
          <option value="">All Agents</option>
          {uniqueAgents.map(agent => (
            <option key={agent} value={agent}>{agent}</option>
          ))}
        </select>

        <select 
          className="border p-2 rounded"
          onChange={(e) => setFilters(prev => ({...prev, alertType: e.target.value || undefined}))}
        >
          <option value="">All Alert Types</option>
          {uniqueAlertTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <ul className="border-l-2 border-primary pl-4">
        {alerts.map((a) => (
          <li key={a.id} className="mb-4 relative">
            <div className="absolute w-3 h-3 bg-primary rounded-full left-[-10px] top-2"></div>
            <div className="flex items-center space-x-2">
              {getAlertIcon(a.status)}
              <p className="text-sm text-muted-foreground">{new Date(a.triggered_at).toLocaleString()}</p>
            </div>
            <p><strong>{a.alert_type}</strong>: {a.message}</p>
            {a.strategy_id && <p className="text-xs text-muted-foreground">↪ Related Strategy: {a.strategy_id}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

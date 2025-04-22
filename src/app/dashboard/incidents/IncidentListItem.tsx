
import React from "react";
import { Check, AlertTriangle, X, Info } from "lucide-react";

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

type Props = {
  alert: AgentAlert;
};

export default function IncidentListItem({ alert }: Props) {
  function getAlertIcon(status: string) {
    switch (status) {
      case "resolved":
        return <Check className="text-green-500 w-4 h-4" />;
      case "in_progress":
        return <AlertTriangle className="text-yellow-500 w-4 h-4" />;
      case "unresolved":
        return <X className="text-red-500 w-4 h-4" />;
      default:
        return <Info className="text-muted-foreground w-4 h-4" />;
    }
  }

  return (
    <li className="mb-4 relative">
      <div className="absolute w-3 h-3 bg-primary rounded-full left-[-10px] top-2"></div>
      <div className="flex items-center space-x-2">
        {getAlertIcon(alert.status)}
        <p className="text-sm text-muted-foreground">
          {new Date(alert.triggered_at).toLocaleString()}
        </p>
      </div>
      <p>
        <strong>{alert.alert_type}</strong>: {alert.message}
      </p>
      {alert.strategy_id && (
        <p className="text-xs text-muted-foreground">
          ↪ Related Strategy: {alert.strategy_id}
        </p>
      )}
    </li>
  );
}

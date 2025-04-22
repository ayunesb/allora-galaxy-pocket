
import React from "react";
import { Check, AlertTriangle, X, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

  function getStatusColor(status: string) {
    switch (status) {
      case "resolved":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "in_progress":
        return "bg-yellow-500/10 text-yellow-700 border-yellow-200";
      case "unresolved": 
        return "bg-red-500/10 text-red-700 border-red-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  }

  return (
    <li className="mb-6 relative">
      <div className="absolute w-3 h-3 bg-primary rounded-full left-[-10px] top-2"></div>
      <Card className={`p-4 ${getStatusColor(alert.status)} border-l-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getAlertIcon(alert.status)}
            <p className="text-sm text-muted-foreground">
              {format(new Date(alert.triggered_at), "MMM d, yyyy h:mm a")}
            </p>
          </div>
          <Badge variant={alert.status === "resolved" ? "outline" : "secondary"}>
            {alert.status}
          </Badge>
        </div>
        
        <div className="mb-2">
          <span className="font-semibold">{alert.agent}</span>
          <span className="text-muted-foreground mx-2">•</span>
          <span className="text-sm font-medium">{alert.alert_type}</span>
        </div>
        
        <p className="text-base mb-3">{alert.message}</p>
        
        {alert.strategy_id && (
          <div className="text-xs text-muted-foreground mt-2">
            <span className="font-medium">Related Strategy:</span>{" "}
            <Link 
              to={`/strategy/${alert.strategy_id}`} 
              className="text-primary underline hover:text-primary/80"
            >
              View strategy details
            </Link>
          </div>
        )}
      </Card>
    </li>
  );
}

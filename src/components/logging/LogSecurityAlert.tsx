
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecurityAlertProps {
  alert: {
    id?: string;
    title: string;
    message: string;
    severity?: "critical" | "high" | "medium" | "low";
    timestamp?: string;
    source?: string;
    actionable?: boolean;
  };
  onAcknowledge?: (id: string) => void;
  onInvestigate?: (id: string) => void;
}

const LogSecurityAlert = ({ alert, onAcknowledge, onInvestigate }: SecurityAlertProps) => {
  // Determine variant based on severity
  const getVariant = () => {
    switch (alert.severity) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      default:
        return "default";
    }
  };

  const getIcon = () => {
    switch (alert.severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      {getIcon()}
      <AlertTitle className="font-bold">{alert.title}</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>{alert.message}</p>
        {alert.source && (
          <div className="text-xs text-muted-foreground">
            Source: {alert.source}
          </div>
        )}
        {alert.timestamp && (
          <div className="text-xs text-muted-foreground">
            {new Date(alert.timestamp).toLocaleString()}
          </div>
        )}
        {alert.actionable && alert.id && (
          <div className="flex space-x-2 mt-2">
            {onAcknowledge && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onAcknowledge(alert.id!)}
              >
                Acknowledge
              </Button>
            )}
            {onInvestigate && (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => onInvestigate(alert.id!)}
              >
                Investigate
              </Button>
            )}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default LogSecurityAlert;

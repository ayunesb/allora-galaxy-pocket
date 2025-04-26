
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LogSystemAlertProps {
  alert: {
    id?: string;
    title: string;
    message: string;
    severity?: "critical" | "warning" | "info";
    timestamp?: string;
  };
}

const LogSystemAlert = ({ alert }: LogSystemAlertProps) => {
  // Determine variant based on severity
  const getVariant = () => {
    switch (alert.severity) {
      case "critical":
        return "destructive";
      case "warning":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Alert variant={getVariant()} className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{alert.title}</AlertTitle>
      <AlertDescription>
        {alert.message}
        {alert.timestamp && (
          <div className="text-xs text-muted-foreground mt-2">
            {new Date(alert.timestamp).toLocaleString()}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default LogSystemAlert;

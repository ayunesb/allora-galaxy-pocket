
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDataPipeline } from "@/hooks/useDataPipeline";
import { ToastService } from "@/services/ToastService";

interface LogSecurityAlertProps {
  title: string;
  description: string;
  severity?: "low" | "medium" | "high" | "critical";
  source?: string;
  onDismiss?: () => void;
}

/**
 * Component for displaying and logging security alerts
 * Supports different severity levels and acknowledgment
 */
export function LogSecurityAlert({ 
  title, 
  description, 
  severity = "medium",
  source = "user_action",
  onDismiss 
}: LogSecurityAlertProps) {
  const { logPipelineEvent } = useDataPipeline();

  const handleAcknowledge = async () => {
    try {
      await logPipelineEvent({
        event_type: "security_alert",
        source: source,
        target: "security_logs",
        metadata: {
          alert_title: title,
          alert_description: description,
          severity,
          acknowledged_at: new Date().toISOString()
        }
      });
      
      ToastService.info({
        title: "Alert Acknowledged",
        description: "This security alert has been logged for review."
      });
      
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error("Failed to log security alert:", error);
      ToastService.error({
        title: "Logging Failed",
        description: "Could not record security acknowledgment"
      });
    }
  };

  const getAlertVariant = () => {
    switch (severity) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
      case "low":
      default:
        return "default";
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <div className="mt-4 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAcknowledge}
        >
          Acknowledge
        </Button>
      </div>
    </Alert>
  );
}

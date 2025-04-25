
import React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SystemLog } from "@/types/systemLog";
import { useSystemLogs } from "@/hooks/useSystemLogs";

interface UnifiedSecurityAlertProps {
  title: string;
  description: string;
  severity?: "low" | "medium" | "high" | "critical";
  timestamp?: string;
  source?: string;
  actionable?: boolean;
  onDismiss?: () => void;
  onAcknowledge?: () => void;
  metadata?: Record<string, any>;
}

/**
 * Unified Security Alert component for displaying and logging security alerts
 * Standardizes alert UI and logging across the application
 */
export function UnifiedSecurityAlert({
  title,
  description,
  severity = "medium",
  timestamp,
  source = "system_monitor",
  actionable = false,
  onDismiss,
  onAcknowledge,
  metadata = {}
}: UnifiedSecurityAlertProps) {
  const { logActivity } = useSystemLogs();

  const getAlertVariant = () => {
    switch (severity) {
      case "critical":
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
      default:
        return "default";
    }
  };

  const handleAcknowledge = async () => {
    try {
      // Log the acknowledgement
      await logActivity({
        event_type: "SECURITY_ALERT_ACKNOWLEDGED",
        message: `Security alert acknowledged: ${title}`,
        meta: {
          ...metadata,
          alert_severity: severity,
          alert_source: source,
          alert_description: description
        }
      });

      toast.success("Alert acknowledged", {
        description: "This security alert has been logged and acknowledged."
      });

      if (onAcknowledge) {
        onAcknowledge();
      }
    } catch (error) {
      console.error("Failed to log security alert acknowledgement:", error);
      toast.error("Failed to acknowledge alert", {
        description: "Please try again or contact support."
      });
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="relative">
      <div className="flex items-start">
        {severity === "critical" || severity === "high" ? (
          <AlertTriangle className="h-5 w-5 mr-2" />
        ) : (
          <ShieldAlert className="h-5 w-5 mr-2" />
        )}
        
        <div className="flex-1">
          <AlertTitle className="font-medium mb-1">
            {title}
          </AlertTitle>
          <AlertDescription>
            <p>{description}</p>
            {timestamp && (
              <div className="text-xs mt-3 opacity-70">
                {new Date(timestamp).toLocaleString()}
              </div>
            )}
          </AlertDescription>
          
          {(actionable || onAcknowledge || onDismiss) && (
            <div className="mt-3 flex gap-2">
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
              
              {(actionable || onAcknowledge) && (
                <Button 
                  size="sm" 
                  variant={severity === "critical" || severity === "high" ? "destructive" : "default"}
                  onClick={handleAcknowledge}
                >
                  Acknowledge
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

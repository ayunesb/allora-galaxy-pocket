
import React from "react";
import { AlertTriangle, ShieldAlert, Info } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToastService } from "@/services/ToastService";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { format } from 'date-fns';

interface LogSecurityAlertProps {
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
 * Standardized Security Alert component for displaying and logging security alerts
 * Supports different severity levels, acknowledgment, and automatic logging
 */
export function LogSecurityAlert({
  title,
  description,
  severity = "medium",
  timestamp,
  source = "system",
  actionable = true,
  onDismiss,
  onAcknowledge,
  metadata = {}
}: LogSecurityAlertProps) {
  const { logActivity } = useSystemLogs();

  const getAlertIcon = () => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-5 w-5 mr-2" />;
      case "medium":
        return <ShieldAlert className="h-5 w-5 mr-2" />;
      case "low":
      default:
        return <Info className="h-5 w-5 mr-2" />;
    }
  };

  const getAlertVariant = () => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
      default:
        return "default";
    }
  };

  const getBadgeVariant = () => {
    switch (severity) {
      case "critical":
        return "destructive";
      case "high":
        return "destructive";
      case "medium":
        return "warning";
      case "low":
      default:
        return "secondary";
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
        },
        severity: severity === "critical" || severity === "high" ? "error" : "warning"
      });

      ToastService.success({
        title: "Alert acknowledged",
        description: "This security alert has been logged and acknowledged."
      });

      if (onAcknowledge) {
        onAcknowledge();
      }
    } catch (error) {
      console.error("Failed to log security alert acknowledgement:", error);
      ToastService.error({
        title: "Failed to acknowledge alert",
        description: "Please try again or contact support."
      });
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="my-4 border relative">
      <div className="flex items-start">
        {getAlertIcon()}
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <AlertTitle className="font-medium">
              {title}
            </AlertTitle>
            <Badge variant={getBadgeVariant()} className="ml-2">
              {severity}
            </Badge>
          </div>
          
          <AlertDescription>
            <p>{description}</p>
            {timestamp && (
              <div className="text-xs mt-3 opacity-70">
                {format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss')}
              </div>
            )}
          </AlertDescription>
          
          {(actionable || onAcknowledge || onDismiss) && (
            <div className="mt-3 flex justify-end gap-2">
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onDismiss}
                >
                  Dismiss
                </Button>
              )}
              
              {actionable && (
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

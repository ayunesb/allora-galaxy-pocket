
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Timestamp } from './ui/Timestamp';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { useToast } from '@/hooks/use-toast';

interface LogSecurityAlertProps {
  severity?: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp?: string;
  actionable?: boolean;
  details?: string;
}

export function LogSecurityAlert({
  severity = 'medium',
  message,
  timestamp,
  actionable = false,
  details
}: LogSecurityAlertProps) {
  const { logActivity } = useSystemLogs();
  const { toast } = useToast();

  const getSeverityStyles = () => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-300 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-300 text-orange-800';
      case 'medium':
        return 'bg-amber-50 border-amber-300 text-amber-800';
      case 'low':
        return 'bg-blue-50 border-blue-300 text-blue-800';
      default:
        return 'bg-amber-50 border-amber-300 text-amber-800';
    }
  };

  const handleAcknowledge = async () => {
    try {
      // Map the component severity to a system log severity
      const logSeverity = severity === 'critical' || severity === 'high' ? 'error' : 'warning';
      
      await logActivity({
        event_type: 'SECURITY_ALERT_ACKNOWLEDGED',
        message: `Security alert acknowledged: ${message}`,
        meta: {
          details,
          alertSeverity: severity
        }
      });

      toast({
        title: "Alert acknowledged",
        description: "This security alert has been logged as acknowledged."
      });
    } catch (error) {
      console.error('Failed to log acknowledgement:', error);
      toast({
        title: "Failed to acknowledge alert",
        description: "There was a problem logging your acknowledgement.",
        variant: "destructive"
      });
    }
  };

  return (
    <Alert className={`${getSeverityStyles()} my-4 border`} variant="default">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 mr-2 mt-1" />
        <div className="flex-1">
          <AlertTitle className="font-medium">
            {severity.charAt(0).toUpperCase() + severity.slice(1)} Security Alert
          </AlertTitle>
          <AlertDescription className="mt-1">
            <p>{message}</p>
            {details && (
              <p className="text-sm mt-2 opacity-80">
                {details}
              </p>
            )}
            {timestamp && (
              <div className="text-xs mt-1 opacity-70">
                <Timestamp date={timestamp} />
              </div>
            )}
          </AlertDescription>
          {actionable && (
            <div className="mt-3">
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleAcknowledge}
                className="border-current text-current hover:bg-current hover:bg-opacity-10 hover:text-white"
              >
                Acknowledge
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

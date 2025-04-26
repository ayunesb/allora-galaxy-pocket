
import React from 'react';
import { AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LogSeverity } from '@/types/systemLog';

interface LogAlertProps {
  title: string;
  description: string;
  severity: LogSeverity | 'success'; // Added 'success' as a valid type
  onDismiss?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function LogAlert({
  title,
  description,
  severity,
  onDismiss,
  actionLabel,
  onAction
}: LogAlertProps) {
  const getSeverityStyles = () => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-300 text-red-800';
      case 'warning':
        return 'bg-amber-50 border-amber-300 text-amber-800';
      case 'success':
        return 'bg-green-50 border-green-300 text-green-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-300 text-blue-800';
    }
  };

  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-5 w-5 mr-2" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 mr-2" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 mr-2" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <Alert className={`${getSeverityStyles()} my-4 border`} variant="default">
      <div className="flex items-start">
        {getIcon()}
        <div className="flex-1">
          <AlertTitle className="font-medium">
            {title}
          </AlertTitle>
          <AlertDescription className="mt-1">
            {description}
          </AlertDescription>
          
          {(onDismiss || onAction) && (
            <div className="mt-3 flex gap-2">
              {onAction && (
                <Button 
                  size="sm" 
                  onClick={onAction}
                  className="border-current text-current hover:bg-current hover:bg-opacity-10"
                >
                  {actionLabel || 'Take Action'}
                </Button>
              )}
              
              {onDismiss && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onDismiss}
                  className="border-current text-current hover:bg-current hover:bg-opacity-10"
                >
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}

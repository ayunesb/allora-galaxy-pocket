
import React from 'react';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SystemAlertProps {
  id?: string;
  title: string;
  description?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp?: string;
  onDismiss?: () => void;
}

export function SystemAlert({ 
  title, 
  description, 
  severity, 
  timestamp,
  onDismiss 
}: SystemAlertProps) {
  const getAlertVariant = () => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'success':
        return 'default';
      case 'info':
      default:
        return 'default';
    }
  };

  const getAlertIcon = () => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Alert variant={getAlertVariant()} className="relative">
      <div className="flex items-start gap-2">
        {getAlertIcon()}
        <div className="flex-1">
          <AlertTitle className="flex items-center justify-between">
            {title}
            {timestamp && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(timestamp), 'yyyy-MM-dd HH:mm')}
              </span>
            )}
          </AlertTitle>
          {description && <AlertDescription>{description}</AlertDescription>}
        </div>
        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 rounded-full"
            onClick={onDismiss}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        )}
      </div>
    </Alert>
  );
}

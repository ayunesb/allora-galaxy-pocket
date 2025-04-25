
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface SystemAlertProps {
  title: string;
  description?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp?: string;
  onDismiss?: () => void;
}

export function SystemAlert({ 
  title, 
  description, 
  severity = 'info',
  timestamp,
  onDismiss 
}: SystemAlertProps) {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };
  
  const getVariant = () => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Alert variant={getVariant()} className="my-2">
      <div className="flex items-start gap-2">
        {getIcon()}
        <div className="flex-1">
          <AlertTitle>{title}</AlertTitle>
          {description && (
            <AlertDescription>{description}</AlertDescription>
          )}
          {timestamp && (
            <div className="mt-2 text-xs text-muted-foreground">
              {new Date(timestamp).toLocaleString()}
            </div>
          )}
        </div>
        {severity !== 'info' && (
          <Badge variant={getVariant()} className="ml-2">
            {severity.toUpperCase()}
          </Badge>
        )}
      </div>
    </Alert>
  );
}

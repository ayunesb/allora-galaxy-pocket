
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ShieldAlert, Info, CheckCircle } from 'lucide-react';

interface SecurityAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  timestamp?: string;
  onAcknowledge?: () => Promise<void> | void;
  onDismiss?: () => void;
  actionLabel?: string;
}

export function SecurityAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  severity = 'medium',
  timestamp,
  onAcknowledge,
  onDismiss,
  actionLabel = 'Acknowledge'
}: SecurityAlertDialogProps) {
  const [isAcknowledging, setIsAcknowledging] = React.useState(false);

  const handleAcknowledge = async () => {
    if (!onAcknowledge) return;
    
    setIsAcknowledging(true);
    try {
      await onAcknowledge();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    } finally {
      setIsAcknowledging(false);
    }
  };

  const getIcon = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'medium':
        return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case 'low':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    }
  };

  const getBadgeVariant = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'outline';
      case 'info':
        return 'secondary';
      default:
        return 'warning';
    }
  };

  const getButtonVariant = () => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
            <Badge className="ml-auto" variant={getBadgeVariant()}>
              {severity.toUpperCase()}
            </Badge>
          </div>
          <DialogDescription className="pt-2">
            {description}

            {timestamp && (
              <div className="mt-4 text-xs text-muted-foreground">
                Alert timestamp: {new Date(timestamp).toLocaleString()}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-2 sm:justify-end">
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
          
          {onAcknowledge && (
            <Button 
              variant={getButtonVariant()}
              onClick={handleAcknowledge}
              disabled={isAcknowledging}
            >
              {isAcknowledging ? 'Processing...' : actionLabel}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

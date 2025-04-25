
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SystemLog } from '@/types/systemLog';
import { format } from 'date-fns';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface LogEntryProps {
  log: SystemLog;
  onClick?: () => void;
  compact?: boolean;
}

export function LogEntry({ log, onClick, compact = false }: LogEntryProps) {
  const getSeverityIcon = () => {
    const severity = log.severity?.toLowerCase();
    
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
  
  const getSeverityVariant = () => {
    const severity = log.severity?.toLowerCase();
    
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'success':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const timestamp = log.timestamp || log.created_at;
  const formattedDate = timestamp ? format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss') : '';

  return (
    <Card 
      className={`mb-2 ${onClick ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''}`}
      onClick={onClick}
    >
      <CardContent className={`${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={getSeverityVariant()} className="flex items-center gap-1">
                {getSeverityIcon()} {log.severity || 'info'}
              </Badge>
              <span className="text-xs text-muted-foreground">{log.event_type}</span>
            </div>
            <p className="text-sm">{log.message}</p>
            {!compact && log.meta && (
              <pre className="mt-2 p-2 bg-muted/50 rounded text-xs overflow-auto max-h-48">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            )}
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {formattedDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

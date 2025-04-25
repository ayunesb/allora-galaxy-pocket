
import React from 'react';
import { SystemAlert } from './SystemAlert';

interface SecurityAlert {
  id: string;
  title: string;
  description?: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
}

interface SecurityAlertsListProps {
  alerts: SecurityAlert[];
  onDismiss?: (id: string) => void;
}

export function SecurityAlertsList({ alerts, onDismiss }: SecurityAlertsListProps) {
  if (!alerts.length) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No security alerts to display
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <SystemAlert
          key={alert.id}
          title={alert.title}
          description={alert.description}
          severity={alert.severity}
          timestamp={alert.timestamp}
          onDismiss={onDismiss ? () => onDismiss(alert.id) : undefined}
        />
      ))}
    </div>
  );
}

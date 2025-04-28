
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestSupabaseConnection } from '@/components/ui/test-supabase-connection';
import { SecurityHealthCheck } from '@/components/SecurityHealthCheck';
import { CircleCheck, CircleX, Circle } from 'lucide-react';

type Status = 'healthy' | 'degraded' | 'offline' | 'unknown';

interface ServiceStatus {
  name: string;
  status: Status;
  lastUpdated: Date;
}

export function SystemStatus() {
  const [services] = React.useState<ServiceStatus[]>([
    { 
      name: 'Database', 
      status: 'unknown', 
      lastUpdated: new Date() 
    },
    { 
      name: 'Authentication', 
      status: 'healthy', 
      lastUpdated: new Date() 
    },
    { 
      name: 'Storage', 
      status: 'healthy', 
      lastUpdated: new Date() 
    },
  ]);

  const StatusIndicator = ({ status }: { status: Status }) => {
    switch (status) {
      case 'healthy':
        return <CircleCheck className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <Circle className="h-5 w-5 text-amber-500" />;
      case 'offline':
        return <CircleX className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            View the current health of system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <TestSupabaseConnection />
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Services</h3>
              <div className="grid gap-2">
                {services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                    <div className="flex items-center space-x-2">
                      <StatusIndicator status={service.status} />
                      <span>{service.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Updated {service.lastUpdated.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SecurityHealthCheck />
    </div>
  );
}

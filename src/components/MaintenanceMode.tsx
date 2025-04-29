
import React from 'react';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, AlertCircle } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';

interface MaintenanceModeProps {
  children: React.ReactNode;
}

export function MaintenanceMode({ children }: MaintenanceModeProps) {
  const { maintenanceInfo, isAdmin, disableMaintenance } = useMaintenanceMode();
  const { role } = useUserRole();
  
  // If the user's role is in the allowed roles, show the children
  const isAllowed = maintenanceInfo.allowedRoles?.includes(role);
  
  if (isAllowed) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="max-w-md shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <CardTitle>Maintenance Mode</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{maintenanceInfo.message || "The system is currently under maintenance. Please check back later."}</p>
          
          {maintenanceInfo.startTime && maintenanceInfo.endTime && (
            <div className="mb-4 rounded bg-muted p-3 text-sm">
              <p>Started: {new Date(maintenanceInfo.startTime).toLocaleString()}</p>
              <p>Expected completion: {new Date(maintenanceInfo.endTime).toLocaleString()}</p>
            </div>
          )}
        </CardContent>
        
        {isAdmin && (
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={disableMaintenance}
            >
              <Settings className="h-4 w-4" />
              Disable Maintenance Mode
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

export default MaintenanceMode;

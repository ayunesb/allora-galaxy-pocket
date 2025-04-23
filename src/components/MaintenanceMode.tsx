
import React from "react";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Settings, AlertTriangle, RefreshCw } from "lucide-react";

interface MaintenanceModeProps {
  children: React.ReactNode;
}

export function MaintenanceMode({ children }: MaintenanceModeProps) {
  const { isLoading, maintenanceMode } = useMaintenanceMode();
  const { role } = useUserRole();
  
  // If still loading the maintenance status
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size={40} label="Checking system status..." />
      </div>
    );
  }
  
  // If maintenance mode is enabled but user role is in allowed list
  if (maintenanceMode.enabled && 
      maintenanceMode.allowedRoles && 
      role && 
      maintenanceMode.allowedRoles.includes(role)) {
    return (
      <div className="relative">
        <div className="sticky top-0 z-50 bg-yellow-500 text-black py-1 px-4 text-center text-sm font-medium flex items-center justify-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          System is in maintenance mode. You have access because of your role.
        </div>
        {children}
      </div>
    );
  }
  
  // If maintenance mode is enabled and user is not allowed
  if (maintenanceMode.enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Settings className="h-12 w-12 mx-auto text-amber-500 mb-2" />
            <CardTitle className="text-2xl">Maintenance in Progress</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-500 dark:text-gray-400">{maintenanceMode.message}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> 
              Check Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // If system is operational, render children
  return <>{children}</>;
}

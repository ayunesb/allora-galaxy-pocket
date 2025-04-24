
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import routes from "../routes"; // Import the routes from the routes file

export const RouteDebugger = () => {
  const location = useLocation();

  useEffect(() => {
    console.log(`Route loaded: ${location.pathname}`);
    console.log("Current route:", location);
  }, [location]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="bg-slate-800 text-white border-red-500 shadow-lg">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertTitle>Debug Mode Active</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <div>
            <strong>Current Route:</strong> {location.pathname}
          </div>
          <Button 
            size="sm" 
            variant="destructive" 
            className="text-xs mt-2"
            onClick={() => {
              console.log('Current route:', location);
              console.log('Route structure:', routes);
            }}
          >
            Debug to Console
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};


import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const RouteDebugger = () => {
  const location = useLocation();

  useEffect(() => {
    console.log(`Route loaded: ${location.pathname}`);
  }, [location]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="bg-slate-800 text-white border-slate-700 shadow-lg">
        <AlertDescription className="flex flex-col gap-2">
          <div>
            <strong>Route:</strong> {location.pathname}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs"
            onClick={() => {
              console.log('Current route:', location);
              console.log('Component tree rendered:', 
                document.querySelector('main')?.innerHTML || 'No main element found');
            }}
          >
            Debug to Console
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
};

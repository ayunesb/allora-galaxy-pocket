
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export const RouteDebugger = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    console.log(`Route loaded: ${location.pathname}`);
    // Check for document structure
    console.log("Main element found:", !!document.querySelector('main'));
    console.log("Body content:", document.body.innerHTML.substring(0, 500) + "...");
  }, [location]);

  if (!visible) {
    return (
      <Button 
        className="fixed bottom-4 right-4 z-50 opacity-50 hover:opacity-100"
        size="sm"
        onClick={() => setVisible(true)}
      >
        Show Debug
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Alert className="bg-slate-800 text-white border-red-500 shadow-lg">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <AlertTitle>Debug Mode Active</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <div>
            <strong>Current Route:</strong> {location.pathname}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="destructive" 
              className="text-xs"
              onClick={() => {
                console.log('Current route:', location);
                console.log('Component tree rendered:', 
                  document.querySelector('main')?.innerHTML || 'No main element found');
                console.log('Body content:', document.body.innerHTML.substring(0, 1000) + "...");
              }}
            >
              Debug to Console
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-white border-white"
              onClick={() => setVisible(false)}
            >
              Hide
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

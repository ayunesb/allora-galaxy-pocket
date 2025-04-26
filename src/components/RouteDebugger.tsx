
import React from 'react';
import { useLocation } from 'react-router-dom';

export function RouteDebugger() {
  try {
    const location = useLocation();
    
    // Only show in development mode
    if (import.meta.env.PROD) {
      return null;
    }

    return (
      <div className="fixed bottom-0 right-0 z-50 p-2 text-xs bg-black/80 text-white rounded-tl-md">
        <div>
          <span className="font-semibold">Route:</span> {location.pathname}
        </div>
        {location.search && (
          <div>
            <span className="font-semibold">Query:</span> {location.search}
          </div>
        )}
      </div>
    );
  } catch (e) {
    // If useLocation throws an error, we're outside Router context
    console.log("RouteDebugger rendered outside Router context");
    return null;
  }
}

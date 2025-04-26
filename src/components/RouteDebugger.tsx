
import React from 'react';
import { useLocation } from 'react-router-dom';

export function RouteDebugger() {
  // We'll use try/catch to handle the case when this component is rendered outside of a Router
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
      </div>
    );
  } catch (e) {
    // If useLocation throws an error, we're outside Router context, so don't render anything
    return null;
  }
}

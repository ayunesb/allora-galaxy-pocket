
import { useEffect } from "react";
import { useTenant } from "./useTenant";

export function useTenantDataProtection() {
  const { tenant } = useTenant();

  useEffect(() => {
    // Add tenant_id to all API requests
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      // Only modify requests to our API
      if (typeof input === 'string' && input.includes('/api/')) {
        init = init || {};
        init.headers = init.headers || {};
        
        // Add tenant context header if we have a tenant
        if (tenant?.id) {
          (init.headers as any)['X-Tenant-ID'] = tenant.id;
        }
      }
      
      return originalFetch.call(this, input, init);
    };

    return () => {
      // Restore original fetch when component unmounts
      window.fetch = originalFetch;
    };
  }, [tenant]);

  return null;
}

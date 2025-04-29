
import { useEffect } from "react";
import { useTenant } from "./useTenant";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
        } else {
          console.warn('No active tenant found when making API request');
        }
      }
      
      return originalFetch.call(this, input, init);
    };
    
    // Add a security check for tenant isolation
    const verifyTenantIsolation = async () => {
      if (!tenant?.id) return;
      
      try {
        // Check that our tenant isolation is working properly
        const { data: verificationResult, error } = await supabase.rpc(
          'verify_tenant_isolation',
          { tenant_uuid: tenant.id }
        );
        
        if (error || !verificationResult?.success) {
          console.error('Tenant isolation verification failed:', error || verificationResult?.message);
          
          // Alert the user about potential security issue
          toast.error('Security warning', {
            description: 'Potential data isolation issue detected. Please contact support.',
            duration: 10000
          });
        }
      } catch (err) {
        console.error('Error verifying tenant isolation:', err);
      }
    };
    
    // Only run the verification in production
    if (process.env.NODE_ENV === 'production') {
      verifyTenantIsolation();
    }

    return () => {
      // Restore original fetch when component unmounts
      window.fetch = originalFetch;
    };
  }, [tenant]);

  return null;
}

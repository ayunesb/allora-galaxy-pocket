import { useState, useEffect } from 'react';
import { Tenant } from '@/types/tenant';

export function useInitializeSelectedTenant(
  availableTenants: Tenant[],
  loading: boolean,
  error: string | null
) {
  const [selected, setSelected] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Don't try to initialize if we're loading or have an error
    if (loading || error || initialized) {
      return;
    }

    // If we have tenants, try to select one
    if (availableTenants.length > 0) {
      // First, try to get the tenant ID from localStorage
      const savedTenantId = localStorage.getItem("tenant_id");

      // If we found a saved ID and it exists in the available tenants, use it
      if (savedTenantId && availableTenants.some(t => t.id === savedTenantId)) {
        setSelected(savedTenantId);
      } else {
        // Otherwise, use the first available tenant
        setSelected(availableTenants[0].id);
        localStorage.setItem("tenant_id", availableTenants[0].id);
      }

      setInitialized(true);
    }
  }, [availableTenants, loading, error, initialized]);

  return {
    selected,
    setSelected,
    initialized
  };
}

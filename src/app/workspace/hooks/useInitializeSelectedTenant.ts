
import { useEffect } from 'react';
import { Tenant } from '@/types/tenant';
import { useAvailableTenants } from './useAvailableTenants';
import { useTenantStore } from '@/app/workspace/store/tenantStore';

/**
 * Hook to initialize the selected tenant from available tenants
 * @returns The currently selected tenant and loading state
 */
export function useInitializeSelectedTenant() {
  const { tenants, loading } = useAvailableTenants();
  const { selectedTenantId, setSelectedTenantId, setTenants } = useTenantStore();

  useEffect(() => {
    if (tenants && tenants.length > 0) {
      // Update available tenants in the store
      setTenants(tenants);
      
      // If no tenant is selected, select the first one
      if (!selectedTenantId && tenants[0]?.id) {
        setSelectedTenantId(tenants[0].id);
      }
    }
  }, [tenants, selectedTenantId, setSelectedTenantId, setTenants]);

  // Find the currently selected tenant
  const selectedTenant = selectedTenantId 
    ? tenants.find(tenant => tenant.id === selectedTenantId) 
    : undefined;

  return {
    selectedTenant,
    loading,
    tenants
  };
}

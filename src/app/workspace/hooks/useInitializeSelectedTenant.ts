
import { useEffect, useState } from 'react';
import { Tenant } from '@/types/tenant';
import { useAvailableTenants } from './useAvailableTenants';
import { useTenantStore } from '@/app/workspace/store/tenantStore';

/**
 * Hook to initialize the selected tenant from available tenants
 * @returns The currently selected tenant, selection controls, and loading state
 */
export function useInitializeSelectedTenant(
  tenantsList: Tenant[] = [], 
  isLoading: boolean = false, 
  error: string | null = null
) {
  const { tenants, loading } = useAvailableTenants();
  const { selectedTenantId, setSelectedTenantId, setTenants } = useTenantStore();
  const [initialized, setInitialized] = useState(false);
  const actualTenants = tenantsList.length > 0 ? tenantsList : tenants;

  useEffect(() => {
    if (actualTenants && actualTenants.length > 0) {
      // Update available tenants in the store
      setTenants(actualTenants);
      
      // If no tenant is selected, select the first one
      if (!selectedTenantId && actualTenants[0]?.id) {
        setSelectedTenantId(actualTenants[0].id);
      }
      
      setInitialized(true);
    }
  }, [actualTenants, selectedTenantId, setSelectedTenantId, setTenants]);

  // Find the currently selected tenant
  const selectedTenant = selectedTenantId 
    ? actualTenants.find(tenant => tenant.id === selectedTenantId) 
    : undefined;

  return {
    selectedTenant,
    loading: isLoading || loading,
    tenants: actualTenants,
    selected: selectedTenantId || "",
    setSelected: setSelectedTenantId,
    initialized,
    error
  };
}

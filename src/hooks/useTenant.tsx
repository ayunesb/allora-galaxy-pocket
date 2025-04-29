
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '@/types/tenant';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { getUserTenants } from '@/utils/TenantSecurity';
import { useUserRole } from './useUserRole';

// Define the updated TenantContext type
interface TenantContextType {
  tenant: Tenant | null;
  setTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  tenants: Tenant[];
  selectTenant: (tenant: Tenant) => void;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
  error: string | null;
  userRole?: string;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { role: userRole } = useUserRole();

  const refreshTenant = async () => {
    if (!user) {
      setTenant(null);
      setTenants([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get all tenants for user safely using our security definer function wrapper
      const tenantIds = await getUserTenants();

      // If no tenants, set to null
      if (!tenantIds?.length) {
        setTenant(null);
        setTenants([]);
        setIsLoading(false);
        return;
      }

      // Fetch all available tenants
      const { data: allTenants, error: tenantsError } = await supabase
        .from('tenant_profiles')
        .select('*')
        .in('id', tenantIds);
        
      if (tenantsError) throw tenantsError;
      
      setTenants(allTenants || []);
      
      // Attempt to load stored tenant preference
      const storedTenantId = localStorage.getItem('tenant_id');
      
      // Check if stored tenant is in user's available tenants
      const tenantIdToUse = storedTenantId && 
        tenantIds.some(id => id === storedTenantId) 
        ? storedTenantId 
        : tenantIds[0];
      
      // Find tenant in already fetched tenants
      const selectedTenant = allTenants?.find(t => t.id === tenantIdToUse) || null;
      
      if (selectedTenant) {
        // Store selected tenant
        localStorage.setItem('tenant_id', selectedTenant.id);
        setTenant(selectedTenant);
      } else {
        // Fallback if tenant not found
        setTenant(null);
      }
      
    } catch (error: any) {
      console.error('Error loading tenant:', error);
      setTenant(null);
      setError(error.message || 'Failed to load workspace data');
      
      toast({
        description: "There was a problem loading your workspace. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectTenant = (selected: Tenant) => {
    localStorage.setItem('tenant_id', selected.id);
    setTenant(selected);
  };
  
  const updateTenantProfile = async (updatedTenant: Partial<Tenant>) => {
    if (!tenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('tenant_profiles')
        .update(updatedTenant)
        .eq('id', tenant.id);
        
      if (error) throw error;
      
      setTenant(prev => prev ? { ...prev, ...updatedTenant } : null);
      
      toast({
        description: "Workspace settings have been updated successfully."
      });
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      
      toast({
        description: error.message || "Failed to update workspace settings.",
      });
      
      throw error;
    }
  };

  useEffect(() => {
    refreshTenant();
  }, [user]);

  return (
    <TenantContext.Provider value={{ 
      tenant, 
      setTenant, 
      tenants, 
      selectTenant,
      isLoading, 
      refreshTenant,
      updateTenantProfile,
      error,
      userRole
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

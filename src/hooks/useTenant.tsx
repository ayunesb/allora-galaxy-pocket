
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant } from '@/types/tenant';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: React.Dispatch<React.SetStateAction<Tenant | null>>;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const refreshTenant = async () => {
    if (!user) {
      setTenant(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Get all tenants for user safely using our security definer function
      const { data: tenantIds, error: tenantIdsError } = await supabase.rpc('get_user_tenant_ids_safe');

      if (tenantIdsError) {
        console.error('Error getting tenant IDs:', tenantIdsError);
        throw tenantIdsError;
      }
      
      // If no tenants, set to null
      if (!tenantIds?.length) {
        setTenant(null);
        setIsLoading(false);
        return;
      }

      // Attempt to load stored tenant preference
      const storedTenantId = localStorage.getItem('tenant_id');
      
      // Check if stored tenant is in user's available tenants
      const tenantIdToUse = storedTenantId && 
        tenantIds.some(id => id === storedTenantId) 
        ? storedTenantId 
        : tenantIds[0];
      
      // Fetch tenant details
      const { data: tenantData, error: tenantError } = await supabase
        .from('tenant_profiles')
        .select('*')
        .eq('id', tenantIdToUse)
        .single();

      if (tenantError) throw tenantError;
      
      // Store selected tenant
      localStorage.setItem('tenant_id', tenantData.id);
      setTenant(tenantData);
      
    } catch (error: any) {
      console.error('Error loading tenant:', error);
      setTenant(null);
      setError(error.message || 'Failed to load workspace data');
      
      toast({
        title: "Workspace loading error",
        description: "There was a problem loading your workspace. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
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
        title: "Workspace updated",
        description: "Workspace settings have been updated successfully."
      });
    } catch (error: any) {
      console.error('Error updating tenant:', error);
      
      toast({
        title: "Update failed",
        description: error.message || "Failed to update workspace settings.",
        variant: "destructive"
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
      isLoading, 
      refreshTenant,
      updateTenantProfile,
      error
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

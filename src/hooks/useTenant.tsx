
import { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { Tenant } from '@/types/tenant'; // Import the correct Tenant type

// Create context type
interface TenantContextValue {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  updateTenantProfile?: (updates: Partial<Tenant>) => Promise<void>;
}

// Create the context with a default value
const TenantContext = createContext<TenantContextValue>({
  tenant: null,
  setTenant: () => {},
  isLoading: true
});

// Provider component
export const TenantProvider = ({ children }: { children: ReactNode }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isLoading: authLoading } = useAuth();

  // Function to update tenant profile
  const updateTenantProfile = async (updates: Partial<Tenant>) => {
    if (!tenant?.id) {
      toast.error("No tenant selected");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tenant_profiles')
        .update(updates)
        .eq('id', tenant.id);
      
      if (error) throw error;
      
      // Update local state
      setTenant(prevTenant => prevTenant ? {
        ...prevTenant,
        ...updates
      } : null);
      
      toast.success("Settings updated successfully");
    } catch (error: any) {
      console.error('Error updating tenant profile:', error);
      toast.error("Failed to update settings");
      throw error;
    }
  };

  useEffect(() => {
    // Don't try to fetch tenant data until we have a user
    if (authLoading || !user) {
      if (!authLoading && !user) {
        setIsLoading(false); // User is not authenticated, so we're not loading
      }
      return;
    }

    const fetchTenant = async () => {
      try {
        // First check if we have a selected tenant ID in local storage
        const storedTenantId = localStorage.getItem('selectedTenantId');
        
        if (storedTenantId) {
          // Try to fetch the specific tenant
          const { data, error } = await supabase
            .from('tenant_profiles')
            .select('*')
            .eq('id', storedTenantId)
            .single();
            
          if (!error && data) {
            // Make sure theme_mode is set to a valid value
            const tenantData: Tenant = {
              ...data,
              theme_mode: data.theme_mode || "light" // Ensure theme_mode is never undefined
            };
            setTenant(tenantData);
            setIsLoading(false);
            return;
          }
          // If error or no data, fall through to fetch the user's tenants
        }
        
        // Fetch the user's tenant roles
        const { data: roles, error: rolesError } = await supabase
          .from('tenant_user_roles')
          .select('tenant_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (rolesError) throw rolesError;
        
        if (roles && roles.length > 0) {
          // Get the first tenant (most recently created)
          const firstTenantId = roles[0].tenant_id;
          
          // Fetch tenant details
          const { data: tenantData, error: tenantError } = await supabase
            .from('tenant_profiles')
            .select('*')
            .eq('id', firstTenantId)
            .single();
            
          if (tenantError) throw tenantError;
          
          if (tenantData) {
            // Make sure theme_mode is set to a valid value
            const processedTenant: Tenant = {
              ...tenantData,
              theme_mode: tenantData.theme_mode || "light" // Ensure theme_mode is never undefined
            };
            setTenant(processedTenant);
            localStorage.setItem('selectedTenantId', processedTenant.id);
          }
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenant();
  }, [user, authLoading]);

  return (
    <TenantContext.Provider value={{ 
      tenant, 
      setTenant, 
      isLoading,
      updateTenantProfile
    }}>
      {children}
    </TenantContext.Provider>
  );
};

// Hook to use the tenant context
export const useTenant = () => useContext(TenantContext);


import { useContext, useState, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tenant } from "@/types/tenant";
import { toast } from "@/components/ui/sonner";
import { TenantContext } from "@/contexts/TenantContext";
import { updateTenantHeader } from "@/integrations/supabase/client";

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  // On initial load, try to restore tenant from localStorage
  useEffect(() => {
    if (initialized) return;
    
    initTenant();
  }, [initialized]);
  
  const initTenant = async () => {
    setIsLoading(true);
    try {
      const storedId = localStorage.getItem("tenant_id");
      
      if (storedId) {
        console.log("Attempting to restore tenant from localStorage:", storedId);
        // Fetch the tenant details directly with minimal fields
        const { data, error } = await supabase
          .from("tenant_profiles")
          .select("id, name, theme_mode, theme_color, enable_auto_approve")
          .eq("id", storedId)
          .maybeSingle();
        
        if (data && !error) {
          console.log("Tenant loaded with details:", data);
          handleSetTenant(data);
        } else {
          // If the stored tenant doesn't exist anymore, clear localStorage
          localStorage.removeItem("tenant_id");
          console.warn("Stored tenant not found, reset to null:", error?.message);
        }
      } else {
        console.log("No tenant ID found in localStorage");
      }
    } catch (err) {
      console.error("Error initializing tenant:", err);
      // Don't throw - just log the error and continue with null tenant
    } finally {
      setIsLoading(false);
      setInitialized(true);
    }
  };
  
  const refreshTenant = async () => {
    if (!tenant?.id) return;
    
    try {
      setIsLoading(true);
      // Use direct tenant_profiles table query with minimal fields
      const { data, error } = await supabase
        .from("tenant_profiles")
        .select("id, name, theme_mode, theme_color, enable_auto_approve")
        .eq("id", tenant.id)
        .maybeSingle();
      
      if (data && !error) {
        setTenant(data);
        console.log("Tenant refreshed with theme:", {
          theme_mode: data.theme_mode,
          theme_color: data.theme_color
        });
      } else if (error) {
        console.error("Error refreshing tenant:", error);
      }
    } catch (err) {
      console.error("Error refreshing tenant:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSetTenant = (newTenant: Tenant | null) => {
    setTenant(newTenant);
    if (newTenant?.id) {
      localStorage.setItem("tenant_id", newTenant.id);
      updateTenantHeader(newTenant.id);
      console.log("Tenant set:", newTenant);
    } else {
      localStorage.removeItem("tenant_id");
      updateTenantHeader(null);
      console.log("Tenant cleared");
    }
  };

  return (
    <TenantContext.Provider value={{ 
      tenant, 
      setTenant: handleSetTenant, 
      isLoading,
      refreshTenant
    }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return context;
}

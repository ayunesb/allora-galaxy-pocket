import { createContext, useContext, useState, useEffect } from "react";
import type { Tenant } from "@/types/tenant";

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTenantId = localStorage.getItem("tenant_id");
    
    if (!storedTenantId) {
      setIsLoading(false);
      return;
    }

    const storedTenant = localStorage.getItem("tenant");
    if (storedTenant) {
      try {
        const parsedTenant = JSON.parse(storedTenant);
        setTenant(parsedTenant);
      } catch (error) {
        console.error("Error parsing stored tenant:", error);
        localStorage.removeItem("tenant");
      }
    }

    setIsLoading(false);
  }, []);

  const updateTenant = (newTenant: Tenant | null) => {
    if (newTenant) {
      localStorage.setItem("tenant_id", newTenant.id);
      localStorage.setItem("tenant", JSON.stringify(newTenant));
    } else {
      localStorage.removeItem("tenant_id");
      localStorage.removeItem("tenant");
    }
    setTenant(newTenant);
  };

  return (
    <TenantContext.Provider value={{ tenant, setTenant: updateTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}

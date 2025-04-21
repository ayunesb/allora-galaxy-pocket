
import { createContext, useContext, useState, ReactNode } from "react";

interface Tenant {
  id: string;
  name: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>({
    id: "demo-tenant",
    name: "Demo Tenant"
  });

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
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

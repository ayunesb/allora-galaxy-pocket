
import { createContext } from 'react';
import { Tenant } from "@/types/tenant";

export interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

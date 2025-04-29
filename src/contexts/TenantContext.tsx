
import { createContext } from 'react';
import { Tenant } from "@/types/tenant";

export interface TenantContextType {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
  userRole?: string;
  tenants?: Tenant[];
  selectTenant?: (tenant: Tenant) => void;
  error?: string | null;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

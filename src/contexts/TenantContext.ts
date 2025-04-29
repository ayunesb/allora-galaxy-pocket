
import { createContext } from 'react';
import { Tenant } from '@/types/tenant';

// Create a separate TenantContext that can be imported by theme-provider
export const TenantContext = createContext<{
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
  userRole?: string;
  tenants?: Tenant[];
  selectTenant?: (tenant: Tenant) => void;
  error?: string | null;
} | undefined>(undefined);

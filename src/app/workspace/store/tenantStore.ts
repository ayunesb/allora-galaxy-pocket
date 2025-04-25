
import { create } from "zustand";
import { Tenant } from "@/types/tenant";

interface TenantStoreState {
  selectedTenantId: string | null;
  tenants: Tenant[];
  setSelectedTenantId: (id: string) => void;
  setTenants: (tenants: Tenant[]) => void;
}

export const useTenantStore = create<TenantStoreState>((set) => ({
  selectedTenantId: null,
  tenants: [],
  setSelectedTenantId: (id: string) => set({ selectedTenantId: id }),
  setTenants: (tenants: Tenant[]) => set({ tenants }),
}));

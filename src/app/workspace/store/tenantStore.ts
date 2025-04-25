
import { create } from "zustand";
import { Tenant } from "@/types/tenant";

interface TenantStoreState {
  tenants: Tenant[];
  selectedTenantId: string | null;
  setTenants: (tenants: Tenant[]) => void;
  setSelectedTenantId: (id: string) => void;
}

export const useTenantStore = create<TenantStoreState>((set) => ({
  tenants: [],
  selectedTenantId: null,
  setTenants: (tenants) => set({ tenants }),
  setSelectedTenantId: (id) => set({ selectedTenantId: id }),
}));

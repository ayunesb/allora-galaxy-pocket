
export interface Tenant {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
  is_demo?: boolean;
  theme_mode?: string;
  theme_color?: string;
  usage_credits?: number;
  slack_webhook_url?: string;
  onboarding_completed?: boolean;
  enable_auto_approve?: boolean;
}

export interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  setTenant: (tenant: Tenant | null) => void;
  userRole?: string;
  tenants?: Tenant[];
  selectTenant?: (tenant: Tenant) => void;
  error?: string | null;
  refreshTenant: () => Promise<void>;
  updateTenantProfile: (updatedTenant: Partial<Tenant>) => Promise<void>;
}

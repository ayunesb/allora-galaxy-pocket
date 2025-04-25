
/**
 * Represents a tenant (workspace) in the system
 */
export interface Tenant {
  id: string;
  name: string;
  role?: string;
  theme_mode?: string;
  theme_color?: string;
  enable_auto_approve?: boolean;
  isDemo?: boolean;
}

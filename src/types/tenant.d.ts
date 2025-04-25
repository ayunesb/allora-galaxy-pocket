
export interface Tenant {
  id: string;
  name?: string;
  enable_auto_approve?: boolean;
  theme_mode?: string;
  theme_color?: string;
  isDemo?: boolean;
  role?: string;
}

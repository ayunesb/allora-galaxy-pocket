
export interface Tenant {
  id: string;
  name: string;
  theme_mode?: "light" | "dark" | "system";
  theme_color?: string;
  enable_auto_approve?: boolean;
  isDemo?: boolean;
  role?: string;
}

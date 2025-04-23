
export interface Tenant {
  id: string;
  name?: string;
  enable_auto_approve?: boolean;  // Added this line
  theme_mode?: string;
  theme_color?: string;
  isDemo?: boolean;
}

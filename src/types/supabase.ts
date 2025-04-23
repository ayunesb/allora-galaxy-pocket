
export type Database = {
  public: {
    Tables: {
      tenant_profiles: {
        Row: {
          id: string;
          name?: string;
          theme_color?: string;
          theme_mode?: string;
          isDemo?: boolean;
          enable_auto_approve?: boolean;
        };
        Insert: {
          id: string;
          name?: string;
          theme_color?: string;
          theme_mode?: string;
          isDemo?: boolean;
          enable_auto_approve?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          theme_color?: string;
          theme_mode?: string;
          isDemo?: boolean;
          enable_auto_approve?: boolean;
        };
      };
      // Add other tables as needed
    };
  };
};

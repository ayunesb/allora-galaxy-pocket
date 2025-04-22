import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

interface AppLayout {
  id: string;
  name: string;
  tenant_id?: string;
  is_global: boolean;
  config: {
    sidebar?: {
      enabled: boolean;
      collapsed?: boolean;
    };
    topbar?: {
      enabled: boolean;
    };
    theme?: {
      mode: 'light' | 'dark' | 'auto';
      color: string;
    };
    navigation?: Array<{
      id: string;
      label: string;
      path: string;
      icon?: string;
    }>;
  };
}

export function useAppLayout() {
  const { tenant } = useTenant();
  
  const { data: layout, isLoading, error } = useQuery({
    queryKey: ['app-layout', tenant?.id],
    queryFn: async () => {
      try {
        // First try to get tenant specific layout
        if (tenant?.id) {
          const { data: tenantLayout } = await supabase
            .from('layouts')
            .select('*')
            .eq('tenant_id', tenant.id)
            .maybeSingle();
            
          if (tenantLayout) {
            return tenantLayout as AppLayout;
          }
        }
        
        // Fall back to global layout
        const { data: globalLayout } = await supabase
          .from('layouts')
          .select('*')
          .eq('is_global', true)
          .maybeSingle();
          
        // If we found a global layout, return it
        if (globalLayout) {
          return globalLayout as AppLayout;
        }
        
        // Otherwise return default layout
        return {
          id: 'default',
          name: 'Default Layout',
          is_global: true,
          config: {
            sidebar: { enabled: true },
            topbar: { enabled: true },
            theme: {
              mode: tenant?.theme_mode as 'light' | 'dark' | 'auto' || 'light',
              color: tenant?.theme_color || 'indigo',
            },
          }
        } as AppLayout;
      } catch (err) {
        console.error("Error fetching layout:", err);
        
        // Return default if error
        return {
          id: 'default',
          name: 'Default Layout',
          is_global: true,
          config: {
            sidebar: { enabled: true },
            topbar: { enabled: true },
            theme: { 
              mode: 'light',
              color: 'indigo'
            },
          }
        } as AppLayout;
      }
    },
    enabled: true, // Always try to load a layout
  });

  return {
    layout: layout || {
      id: 'default',
      name: 'Default Layout',
      is_global: true,
      config: {
        sidebar: { enabled: true },
        topbar: { enabled: true },
        theme: { 
          mode: 'light',
          color: 'indigo'
        },
      }
    },
    isLoading,
    error
  };
}

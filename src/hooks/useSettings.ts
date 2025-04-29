
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export interface AppSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  description?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export function useSettings(category?: string) {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  
  const queryKey = ['settings', tenant?.id, category];

  const { data: settings, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      try {
        // Use system_config table instead of settings
        const query = supabase
          .from('system_config')
          .select('*');
        
        if (category) {
          // Assuming category is stored in the config JSON
          query.filter('config->category', 'eq', category);
        }

        const { data, error } = await query;
        
        if (error) {
          console.warn("Error fetching settings:", error);
          return [];
        }

        // Transform the data to match the AppSetting interface
        const transformedData: AppSetting[] = data.map(item => ({
          id: item.key,
          key: item.key,
          value: item.config.value,
          category: item.config.category || 'general',
          description: item.config.description,
          tenant_id: tenant.id,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));

        return transformedData;
      } catch (err) {
        console.error("Error in settings query:", err);
        return [];
      }
    },
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const updateSetting = useMutation({
    mutationFn: async ({ key, value, category: cat }: { key: string; value: any; category?: string }) => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      const { data, error } = await supabase
        .from('system_config')
        .upsert({
          key,
          config: {
            value,
            category: cat || 'general',
            updated_at: new Date().toISOString()
          }
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    }
  });

  // Helper to get a single setting by key
  const getSetting = (key: string) => {
    if (!settings) return null;
    const setting = settings.find(s => s.key === key);
    return setting?.value ?? null;
  };

  // Get all settings in a category as an object
  const getCategorySettings = (categoryName: string) => {
    if (!settings) return {};
    
    return settings
      .filter(s => s.category === categoryName)
      .reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);
  };

  return {
    settings,
    isLoading,
    error,
    getSetting,
    getCategorySettings,
    updateSetting: (key: string, value: any, category?: string) => 
      updateSetting.mutateAsync({ key, value, category })
  };
}


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface AppSetting {
  key: string;
  value: string | number | boolean | object | null;
  category: string;
  description?: string;
}

export function useAppSettings(category?: string) {
  const queryKey = category ? ['app-settings', category] : ['app-settings'];

  const { data: settings, isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      // Check if the settings table exists
      try {
        const query = supabase.from('settings').select('*');
        
        if (category) {
          query.eq('category', category);
        }

        const { data, error } = await query;
        
        if (error) {
          console.warn("Error fetching settings:", error);
          return [];
        }

        return data as AppSetting[];
      } catch (err) {
        console.error("Error in settings query:", err);
        return [];
      }
    },
    // Settings don't change often, so we can cache them for longer
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Helper to get a single setting by key
  const getSetting = (key: string): any => {
    if (!settings) return null;
    const setting = settings.find(s => s.key === key);
    return setting?.value ?? null;
  };

  // Get all settings in a category as an object
  const getCategorySettings = (categoryName: string): Record<string, any> => {
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
    getCategorySettings
  };
}

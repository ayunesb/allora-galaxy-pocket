
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define proper interfaces
export interface AppLayout {
  id: string;
  name: string;
  columns: number;
  enabled: boolean;
  position?: 'top' | 'middle' | 'bottom';
  widgets?: string[];
}

export function useAppLayout() {
  const [layouts, setLayouts] = useState<AppLayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchLayouts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'app_layouts')
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No data found, initialize with default layouts
          const defaultLayouts: AppLayout[] = [
            { id: 'default-dashboard', name: 'Default Dashboard', columns: 2, enabled: true },
            { id: 'compact-view', name: 'Compact View', columns: 1, enabled: false },
          ];
          setLayouts(defaultLayouts);
          return;
        }
        throw fetchError;
      }

      // Parse the JSON data safely
      if (data && data.config) {
        const configData = typeof data.config === 'string' 
          ? JSON.parse(data.config) 
          : data.config;
          
        if (configData.layouts && Array.isArray(configData.layouts)) {
          setLayouts(configData.layouts);
        } else {
          // Initialize with defaults if the format is unexpected
          setLayouts([
            { id: 'default-dashboard', name: 'Default Dashboard', columns: 2, enabled: true },
            { id: 'compact-view', name: 'Compact View', columns: 1, enabled: false },
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching app layouts:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch app layouts'));
      toast({
        title: "Failed to load layouts",
        description: "There was a problem loading the application layouts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLayouts = async (newLayouts: AppLayout[]) => {
    try {
      // Convert layouts to a JSON string for storage
      const configString = JSON.stringify({ layouts: newLayouts });
      
      const { error: updateError } = await supabase
        .from('system_config')
        .upsert({ 
          key: 'app_layouts',
          config: configString
        }, {
          onConflict: 'key'
        });

      if (updateError) throw updateError;

      setLayouts(newLayouts);
      toast({
        title: "Layouts updated",
        description: "Your layout preferences have been saved.",
      });
      
      return true;
    } catch (err) {
      console.error('Error updating app layouts:', err);
      toast({
        title: "Failed to save layouts",
        description: "There was a problem saving your layout preferences.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  return {
    layouts,
    isLoading,
    error,
    refreshLayouts: fetchLayouts,
    updateLayouts,
  };
}

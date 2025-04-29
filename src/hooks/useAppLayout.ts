
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useTenant } from './useTenant';

export interface AppLayout {
  id: string;
  name: string;
  config: {
    sidebar?: boolean;
    header?: boolean;
    footer?: boolean;
    darkMode?: boolean;
    navigationItems?: {
      name: string;
      href: string;
      icon?: string;
    }[];
  };
}

export function useAppLayout() {
  const [layouts, setLayouts] = useState<AppLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { tenant } = useTenant();

  // Function to fetch layouts from the system_config table
  const fetchLayouts = useCallback(async () => {
    if (!tenant?.id) return [];
    
    setIsLoading(true);
    
    try {
      // Get app_layouts from system_config
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'app_layouts');
      
      if (error) throw error;
      
      // Extract layouts from config
      let layoutsData: AppLayout[] = [];
      
      if (data && data.length > 0 && data[0].config) {
        const configObj = typeof data[0].config === 'string' ? 
          JSON.parse(data[0].config) : data[0].config;
          
        if (configObj && typeof configObj === 'object' && Array.isArray(configObj.layouts)) {
          layoutsData = configObj.layouts;
        }
      }
        
      return layoutsData;
    } catch (err) {
      console.error('Error fetching layouts:', err);
      toast({
        title: 'Error',
        description: 'Failed to load application layouts',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [tenant, toast]);

  useEffect(() => {
    const loadLayouts = async () => {
      const data = await fetchLayouts();
      setLayouts(data);
    };
    
    loadLayouts();
  }, [fetchLayouts]);

  const saveLayout = useCallback(async (layout: AppLayout) => {
    if (!tenant?.id) return false;
    
    try {
      // Update the layouts in the system_config table
      const updatedLayouts = [...layouts];
      const existingIndex = updatedLayouts.findIndex(l => l.id === layout.id);
      
      if (existingIndex >= 0) {
        updatedLayouts[existingIndex] = layout;
      } else {
        updatedLayouts.push(layout);
      }
      
      // Update the app_layouts config in system_config
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'app_layouts',
          config: { layouts: updatedLayouts }
        });
      
      if (error) throw error;
      
      setLayouts(updatedLayouts);
      return true;
    } catch (err) {
      console.error('Error saving layout:', err);
      toast({
        title: 'Error',
        description: 'Failed to save layout',
        variant: 'destructive',
      });
      return false;
    }
  }, [layouts, tenant, toast]);

  return {
    layouts,
    currentLayout,
    isLoading,
    setCurrentLayout,
    saveLayout
  };
}

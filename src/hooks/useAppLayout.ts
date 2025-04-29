
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

  // Mock function to get layouts until we have a proper table
  const fetchLayouts = useCallback(async () => {
    if (!tenant?.id) return [];
    
    setIsLoading(true);
    
    try {
      // Since we don't have a 'layouts' table in Supabase,
      // we'll use system_config to store layouts
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'app_layouts');
      
      if (error) throw error;
      
      // Extract layouts from config
      const layoutsData = data?.[0]?.config && 
        typeof data[0].config === 'object' && 
        Array.isArray((data[0].config as any).layouts) ? 
        (data[0].config as any).layouts : [];
        
      return layoutsData as AppLayout[];
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
      
      // Convert the layouts to JSON
      const layoutsJson = JSON.stringify({ layouts: updatedLayouts });
      
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'app_layouts',
          config: layoutsJson
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

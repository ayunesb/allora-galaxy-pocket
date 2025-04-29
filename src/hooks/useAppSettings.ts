
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useTenant } from './useTenant';

interface AppSetting {
  key: string;
  value: any;
  category?: string;
  description?: string;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { tenant } = useTenant();

  useEffect(() => {
    async function loadSettings() {
      if (!tenant?.id) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('system_config')
          .select('*');
        
        if (error) throw error;
        
        // Transform the data into the expected format
        const formattedSettings = data.map(item => {
          const config = typeof item.config === 'object' ? item.config : {};
          return {
            key: item.key,
            value: config.value !== undefined ? config.value : null,
            category: config.category || 'General',
            description: config.description || '',
          };
        });
        
        setSettings(formattedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load application settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadSettings();
  }, [tenant, toast]);

  const updateSetting = async (key: string, value: any) => {
    if (!tenant?.id) return false;
    
    try {
      const existingSetting = settings.find(s => s.key === key);
      const category = existingSetting?.category || 'General';
      const description = existingSetting?.description || '';
      
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key,
          config: {
            value,
            category,
            description
          }
        });
      
      if (error) throw error;
      
      // Update the local state
      setSettings(prev => 
        prev.map(s => s.key === key ? { ...s, value } : s)
      );
      
      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
      return false;
    }
  };

  const getSetting = (key: string, defaultValue?: any) => {
    const setting = settings.find(s => s.key === key);
    return setting !== undefined ? setting.value : defaultValue;
  };

  return {
    settings,
    isLoading,
    updateSetting,
    getSetting
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';

interface AppSetting {
  key: string;
  value: any;
  category: string;
  description: string;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { tenant } = useTenant();

  useEffect(() => {
    const fetchSettings = async () => {
      if (!tenant?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('*')
          .eq('key', 'app_settings');
        
        if (error) throw error;

        if (data && data.length > 0 && data[0].config) {
          // Parse settings from the config field
          const configObj = typeof data[0].config === 'string' ? 
            JSON.parse(data[0].config) : data[0].config;
            
          if (configObj && typeof configObj === 'object' && Array.isArray(configObj.settings)) {
            // Map settings to the expected format
            const formattedSettings = configObj.settings.map((setting: any) => ({
              key: setting.key || '',
              value: setting.value || '',
              category: setting.category || 'general',
              description: setting.description || ''
            }));
            
            setSettings(formattedSettings);
          } else {
            setSettings([]);
          }
        } else {
          setSettings([]);
        }
      } catch (err) {
        console.error('Error fetching app settings:', err);
        setSettings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [tenant]);

  const updateSetting = async (key: string, value: any) => {
    if (!tenant?.id) return false;

    try {
      // Find the setting to update
      const settingIndex = settings.findIndex(s => s.key === key);
      if (settingIndex === -1) return false;

      // Create a new settings array with the updated value
      const updatedSettings = [...settings];
      updatedSettings[settingIndex] = {
        ...updatedSettings[settingIndex],
        value
      };

      // Update in Supabase
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'app_settings',
          config: { settings: updatedSettings }
        });

      if (error) throw error;

      // Update local state
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      console.error('Error updating app setting:', err);
      return false;
    }
  };

  return {
    settings,
    isLoading,
    updateSetting,
    getSetting: (key: string) => settings.find(s => s.key === key)?.value
  };
}

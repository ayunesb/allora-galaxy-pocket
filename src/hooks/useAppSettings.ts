
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define proper interfaces
export interface AppSetting {
  key: string;
  value: string | number | boolean;
  category: string;
  description?: string;
}

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'app_settings')
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No data found, initialize with default settings
          const defaultSettings: AppSetting[] = [
            { key: 'enable_notifications', value: true, category: 'general', description: 'Enable system notifications' },
            { key: 'dark_mode', value: false, category: 'appearance', description: 'Use dark mode' },
          ];
          setSettings(defaultSettings);
          return;
        }
        throw fetchError;
      }

      // Parse the JSON data safely
      if (data && data.config) {
        const configData = typeof data.config === 'string' 
          ? JSON.parse(data.config) 
          : data.config;
          
        if (configData.settings && Array.isArray(configData.settings)) {
          setSettings(configData.settings);
        } else {
          // Initialize with defaults if format is unexpected
          setSettings([
            { key: 'enable_notifications', value: true, category: 'general', description: 'Enable system notifications' },
            { key: 'dark_mode', value: false, category: 'appearance', description: 'Use dark mode' },
          ]);
        }
      }
    } catch (err) {
      console.error('Error fetching app settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch app settings'));
      toast({
        title: "Failed to load settings",
        description: "There was a problem loading the application settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: AppSetting[]) => {
    try {
      // Convert settings to string for storage as Json
      const configString = JSON.stringify({ settings: newSettings });
      
      const { error: updateError } = await supabase
        .from('system_config')
        .upsert({ 
          key: 'app_settings',
          config: configString
        }, {
          onConflict: 'key'
        });

      if (updateError) throw updateError;

      setSettings(newSettings);
      toast({
        title: "Settings updated",
        description: "Your settings have been saved.",
      });
      
      return true;
    } catch (err) {
      console.error('Error updating app settings:', err);
      toast({
        title: "Failed to save settings",
        description: "There was a problem saving your settings.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getSetting = (key: string) => {
    return settings.find(setting => setting.key === key)?.value;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    getSetting,
    isLoading,
    error,
    refreshSettings: fetchSettings,
    updateSettings,
  };
}

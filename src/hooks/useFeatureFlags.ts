
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useUserRole } from './useUserRole';

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  roles_allowed?: string[];
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { tenant } = useTenant();
  const { role } = useUserRole();

  useEffect(() => {
    const fetchFeatureFlags = async () => {
      if (!tenant?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('*')
          .eq('key', 'feature_flags')
          .maybeSingle();

        if (error) throw error;

        let flagsData: FeatureFlag[] = [];
        
        if (data && data.config) {
          // Parse flags from config
          const configObj = typeof data.config === 'string' ? 
            JSON.parse(data.config) : data.config;
            
          if (Array.isArray(configObj.flags)) {
            flagsData = configObj.flags;
          }
        }

        // Create a map of flag keys to their enabled status
        const flagMap: Record<string, boolean> = {};
        
        flagsData.forEach((flag) => {
          // If the flag has role restrictions, check if the current user's role is allowed
          if (flag.roles_allowed && flag.roles_allowed.length > 0) {
            // Only enable if user has required role
            flagMap[flag.key] = flag.enabled && flag.roles_allowed.includes(role || '');
          } else {
            // No role restrictions, just use the enabled status
            flagMap[flag.key] = flag.enabled;
          }
        });

        setFlags(flagMap);
      } catch (err) {
        console.error('Error fetching feature flags:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeatureFlags();
  }, [tenant, role]);

  const isEnabled = (flagKey: string): boolean => {
    return !!flags[flagKey];
  };

  // Create new flag (admin function)
  const createFlag = async (flag: FeatureFlag): Promise<boolean> => {
    if (!tenant?.id) return false;

    try {
      // Get current flags
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'feature_flags')
        .maybeSingle();

      if (error) throw error;

      let currentFlags: FeatureFlag[] = [];
      
      if (data && data.config) {
        const configObj = typeof data.config === 'string' ? 
          JSON.parse(data.config) : data.config;
          
        if (Array.isArray(configObj.flags)) {
          currentFlags = configObj.flags;
        }
      }

      // Add new flag
      const updatedFlags = [...currentFlags, flag];
      
      // Update flags in system_config
      await supabase
        .from('system_config')
        .upsert({
          key: 'feature_flags',
          config: JSON.stringify({ flags: updatedFlags })
        });

      // Update local state
      setFlags(prev => ({ ...prev, [flag.key]: flag.enabled }));
      return true;
    } catch (err) {
      console.error('Error creating feature flag:', err);
      return false;
    }
  };

  return {
    isEnabled,
    isLoading,
    createFlag
  };
}

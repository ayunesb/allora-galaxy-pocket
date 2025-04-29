
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

// Define proper interfaces
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  roles_allowed?: string[];
}

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const { role } = useUserRole();

  const fetchFlags = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Feature flags come from system_config table
      const { data, error: fetchError } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'feature_flags')
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No data found, initialize with default flags
          const defaultFlags: FeatureFlag[] = [
            { key: 'beta_features', enabled: false, description: 'Enable beta features', roles_allowed: ['admin'] },
            { key: 'advanced_analytics', enabled: true, description: 'Enable advanced analytics' },
          ];
          setFlags(defaultFlags);
          return;
        }
        throw fetchError;
      }

      // Parse the JSON data safely
      if (data && data.config) {
        const configData = typeof data.config === 'string' 
          ? JSON.parse(data.config) 
          : data.config;
          
        if (configData.flags && Array.isArray(configData.flags)) {
          setFlags(configData.flags);
        } else {
          setFlags([]);
        }
      }
    } catch (err) {
      console.error('Error fetching feature flags:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch feature flags'));
      toast({
        title: "Failed to load feature flags",
        description: "There was a problem loading the feature flags.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlags = async (newFlags: FeatureFlag[]) => {
    try {
      // Convert flags to string for storage as Json
      const configString = JSON.stringify({ flags: newFlags });
      
      const { error: updateError } = await supabase
        .from('system_config')
        .upsert({ 
          key: 'feature_flags',
          config: configString
        }, {
          onConflict: 'key'
        });

      if (updateError) throw updateError;

      setFlags(newFlags);
      toast({
        title: "Feature flags updated",
        description: "Your feature flag settings have been saved.",
      });
      
      return true;
    } catch (err) {
      console.error('Error updating feature flags:', err);
      toast({
        title: "Failed to save feature flags",
        description: "There was a problem saving your feature flag settings.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Check if a feature is enabled and the user has access
  const isFeatureEnabled = useCallback((key: string): boolean => {
    if (!flags || flags.length === 0) return false;
    
    const flag = flags.find(f => f.key === key);
    if (!flag) return false;
    
    // If the flag is disabled, return false
    if (!flag.enabled) return false;
    
    // If the flag has role restrictions, check if user's role is allowed
    if (flag.roles_allowed && flag.roles_allowed.length > 0) {
      return flag.roles_allowed.includes(role);
    }
    
    // No role restrictions, flag is enabled
    return true;
  }, [flags, role]);

  useEffect(() => {
    fetchFlags();
  }, []);

  return {
    flags,
    isLoading,
    error,
    refreshFlags: fetchFlags,
    updateFlags,
    isFeatureEnabled
  };
}


import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useAuth } from './useAuth';

export function usePluginPermissions() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});

  const checkPermission = useCallback(async (pluginKey: string, action: 'enable' | 'use') => {
    if (!tenant?.id || !user?.id) return false;
    
    // Check if we've already cached this permission
    if (permissions[pluginKey]?.[action]) {
      return permissions[pluginKey][action];
    }
    
    try {
      const { data } = await supabase.rpc(
        'check_plugin_permission',
        {
          _tenant_id: tenant.id,
          _user_id: user.id,
          _plugin_key: pluginKey,
          _action: action
        }
      );
      
      // Cache the result
      setPermissions(prev => ({
        ...prev,
        [pluginKey]: {
          ...(prev[pluginKey] || {}),
          [action]: !!data
        }
      }));
      
      return !!data;
    } catch (error) {
      console.error('Error checking plugin permission:', error);
      return false;
    }
  }, [tenant?.id, user?.id, permissions]);
  
  return { checkPermission };
}


import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";

export function usePluginPermissions() {
  const { user } = useAuth();
  const { tenant } = useTenant();

  const checkPermission = useCallback(async (pluginKey: string, action: 'enable' | 'use') => {
    if (!user?.id || !tenant?.id) return false;

    const { data, error } = await supabase.rpc('check_plugin_permission', {
      _tenant_id: tenant.id,
      _user_id: user.id,
      _plugin_key: pluginKey,
      _action: action
    });

    if (error) {
      console.error('Error checking plugin permission:', error);
      return false;
    }

    return data || false;
  }, [user?.id, tenant?.id]);

  return { checkPermission };
}

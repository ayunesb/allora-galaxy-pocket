
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { LogSeverity } from '@/types/systemLog';

interface PluginLogOptions {
  pluginKey: string;
  event: string;
  page?: string;
  count?: number;
  eventType?: string;
  metadata?: Record<string, any>;
  severity?: LogSeverity;
}

export function usePluginLogger() {
  const { tenant } = useTenant();
  const [isLogging, setIsLogging] = useState(false);

  const logPluginEvent = async ({
    pluginKey,
    event,
    page,
    count = 1,
    eventType = 'usage',
    metadata = {},
    severity = 'info'
  }: PluginLogOptions) => {
    if (!tenant?.id || !pluginKey) {
      console.warn("Can't log plugin event: Missing tenant ID or plugin key");
      return { success: false };
    }

    setIsLogging(true);
    
    try {
      // Log to plugin_usage_logs
      const { error: usageError } = await supabase
        .from('plugin_usage_logs')
        .insert({
          tenant_id: tenant.id,
          plugin_key: pluginKey,
          event,
          page,
          count,
          event_type: eventType,
          created_at: new Date().toISOString()
        });
        
      if (usageError) throw usageError;

      // Also log to system_logs for visibility in admin panel
      const { error: systemError } = await supabase
        .from('system_logs')
        .insert({
          tenant_id: tenant.id,
          event_type: `PLUGIN_${eventType.toUpperCase()}`,
          message: `Plugin "${pluginKey}" ${event}`,
          meta: {
            plugin_key: pluginKey,
            event,
            page,
            ...metadata
          },
          severity,
          created_at: new Date().toISOString()
        });
        
      if (systemError) throw systemError;
      
      return { success: true };
    } catch (error) {
      console.error("Failed to log plugin event:", error);
      return { success: false, error };
    } finally {
      setIsLogging(false);
    }
  };

  return {
    logPluginEvent,
    isLogging
  };
}

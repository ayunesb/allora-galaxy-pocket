
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useSystemLogs } from './useSystemLogs';

interface PluginLogOptions {
  pluginKey: string;
  event: string;
  page?: string;
  count?: number;
  eventType?: string;
  metadata?: Record<string, any>;
}

export function usePluginLogger() {
  const { tenant } = useTenant();
  const [isLogging, setIsLogging] = useState(false);
  const { logActivity } = useSystemLogs();

  const logPluginEvent = async ({
    pluginKey,
    event,
    page,
    count = 1,
    eventType = 'usage',
    metadata = {}
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
      await logActivity(
        `PLUGIN_${eventType.toUpperCase()}`,
        `Plugin "${pluginKey}" ${event}`,
        {
          plugin_key: pluginKey,
          event,
          page,
          ...metadata
        },
        'info'
      );
      
      return { success: true };
    } catch (error) {
      console.error("Failed to log plugin event:", error);
      return { success: false, error };
    } finally {
      setIsLogging(false);
    }
  };

  // Simplified version for direct component usage
  const logUsage = async (pluginKey: string, event: string, source?: string) => {
    return logPluginEvent({
      pluginKey,
      event,
      eventType: source || 'interaction',
      metadata: { source }
    });
  };

  return {
    logPluginEvent,
    logUsage,
    isLogging
  };
}

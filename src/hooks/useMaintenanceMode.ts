
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface MaintenanceInfo {
  enabled: boolean;
  message: string;
  allowedRoles: string[];
  startTime: string | null;
  endTime: string | null;
}

export function useMaintenanceMode() {
  const [maintenanceInfo, setMaintenanceInfo] = useState<MaintenanceInfo>({
    enabled: false,
    message: '',
    allowedRoles: [],
    startTime: null,
    endTime: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { role } = useUserRole();
  const isAdmin = role === 'admin';

  useEffect(() => {
    const fetchMaintenanceMode = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('system_config')
          .select('config')
          .eq('key', 'maintenance_mode')
          .maybeSingle();

        if (error) throw error;

        if (data && data.config && typeof data.config === 'object') {
          const config = data.config as Record<string, any>;
          setMaintenanceInfo({
            enabled: Boolean(config.enabled),
            message: String(config.message || 'System is under maintenance'),
            allowedRoles: Array.isArray(config.allowedRoles) ? config.allowedRoles : ['admin'],
            startTime: config.startTime ? String(config.startTime) : null,
            endTime: config.endTime ? String(config.endTime) : null
          });
        } else {
          // Default values if no config is found
          setMaintenanceInfo({
            enabled: false,
            message: 'System is under maintenance',
            allowedRoles: ['admin'],
            startTime: null,
            endTime: null
          });
        }
      } catch (err) {
        console.error('Error fetching maintenance mode:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenanceMode();
  }, []);

  const enableMaintenance = async (message: string, endTime?: string) => {
    if (!isAdmin) return;

    try {
      const maintenanceConfig = {
        enabled: true,
        message,
        allowedRoles: ['admin'],
        startTime: new Date().toISOString(),
        endTime: endTime || null
      };

      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'maintenance_mode',
          config: maintenanceConfig
        });

      if (error) throw error;
      
      setMaintenanceInfo(maintenanceConfig);
      
      toast({
        title: 'Maintenance Mode Enabled',
        description: 'The system is now in maintenance mode.'
      });
    } catch (err) {
      console.error('Error enabling maintenance mode:', err);
      toast({
        title: 'Error',
        description: 'Failed to enable maintenance mode.',
        variant: 'destructive'
      });
    }
  };

  const disableMaintenance = async () => {
    if (!isAdmin) return;
    
    try {
      const maintenanceConfig = {
        enabled: false,
        message: '',
        allowedRoles: ['admin'],
        startTime: null,
        endTime: null
      };
      
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'maintenance_mode',
          config: maintenanceConfig
        });

      if (error) throw error;
      
      setMaintenanceInfo(maintenanceConfig);
      
      toast({
        title: 'Maintenance Mode Disabled',
        description: 'The system is now accessible to all users.'
      });
    } catch (err) {
      console.error('Error disabling maintenance mode:', err);
      toast({
        title: 'Error',
        description: 'Failed to disable maintenance mode.',
        variant: 'destructive'
      });
    }
  };

  return {
    maintenanceInfo,
    isLoading,
    isAdmin,
    enableMaintenance,
    disableMaintenance
  };
}

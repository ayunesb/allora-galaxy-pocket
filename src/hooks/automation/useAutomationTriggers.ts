import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { useSystemLogs } from '@/hooks/useSystemLogs';
import { toast } from 'sonner';

export interface AutomationTrigger {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  conditions: Record<string, any>;
  actions: Record<string, any>[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  created_by?: string;
}

export function useAutomationTriggers() {
  const [triggers, setTriggers] = useState<AutomationTrigger[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();

  const fetchTriggers = async () => {
    if (!tenant?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('automation_triggers')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      setTriggers(data || []);
    } catch (err) {
      console.error('Error fetching automation triggers:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch automation triggers'));
    } finally {
      setIsLoading(false);
    }
  };

  const createTrigger = async (triggerData: Omit<AutomationTrigger, 'id' | 'created_at' | 'updated_at' | 'tenant_id'>) => {
    if (!tenant?.id) {
      toast.error('No workspace selected');
      return null;
    }

    setIsLoading(true);
    try {
      const newTrigger = {
        ...triggerData,
        tenant_id: tenant.id,
      };

      const { data, error } = await supabase
        .from('automation_triggers')
        .insert(newTrigger)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Log the activity with proper parameters
      await logActivity(
        'AUTOMATION_TRIGGER_CREATED',
        `Automation trigger "${triggerData.name}" created`,
        {
          trigger_id: data.id,
          event_type: triggerData.event_type
        }
      );

      toast.success('Automation trigger created');
      setTriggers(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating automation trigger:', err);
      toast.error('Failed to create automation trigger');
      setError(err instanceof Error ? err : new Error('Failed to create automation trigger'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTrigger = async (id: string, updates: Partial<AutomationTrigger>) => {
    if (!tenant?.id) {
      toast.error('No workspace selected');
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('automation_triggers')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenant.id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Log the activity with proper parameters
      await logActivity(
        'AUTOMATION_TRIGGER_UPDATED',
        `Automation trigger "${data.name}" updated`,
        {
          trigger_id: id,
          updates: Object.keys(updates)
        }
      );

      toast.success('Automation trigger updated');
      setTriggers(prev => prev.map(trigger => trigger.id === id ? { ...trigger, ...updates } : trigger));
      return true;
    } catch (err) {
      console.error('Error updating automation trigger:', err);
      toast.error('Failed to update automation trigger');
      setError(err instanceof Error ? err : new Error('Failed to update automation trigger'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTrigger = async (id: string) => {
    if (!tenant?.id) {
      toast.error('No workspace selected');
      return false;
    }

    setIsLoading(true);
    try {
      // Get the trigger name before deletion for the log
      const triggerToDelete = triggers.find(t => t.id === id);
      
      const { error } = await supabase
        .from('automation_triggers')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenant.id);

      if (error) throw new Error(error.message);

      // Log the activity with proper parameters
      await logActivity(
        'AUTOMATION_TRIGGER_DELETED',
        `Automation trigger "${triggerToDelete?.name || id}" deleted`,
        { trigger_id: id }
      );

      toast.success('Automation trigger deleted');
      setTriggers(prev => prev.filter(trigger => trigger.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting automation trigger:', err);
      toast.error('Failed to delete automation trigger');
      setError(err instanceof Error ? err : new Error('Failed to delete automation trigger'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTriggerActive = async (id: string, isActive: boolean) => {
    return updateTrigger(id, { is_active: isActive });
  };

  useEffect(() => {
    fetchTriggers();
  }, [tenant?.id]);

  return {
    triggers,
    isLoading,
    error,
    fetchTriggers,
    createTrigger,
    updateTrigger,
    deleteTrigger,
    toggleTriggerActive
  };
}

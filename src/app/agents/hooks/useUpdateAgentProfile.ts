
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AgentProfile } from '@/types/agent';
import { toast } from '@/components/ui/sonner';

export function useUpdateAgentProfile() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateProfile = async (id: string, profileData: Partial<AgentProfile>): Promise<boolean> => {
    if (!profileData.agent_name) {
      // Make sure agent_name is always included since it's required
      setError(new Error('Agent name is required'));
      toast.error('Agent name is required');
      return false;
    }

    setUpdating(true);
    setError(null);
    
    try {
      const { error: updateError } = await supabase
        .from('agent_profiles')
        .update({ 
          agent_name: profileData.agent_name,
          ...profileData,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      toast.success('Agent profile updated successfully');
      return true;
    } catch (err) {
      console.error('Error updating agent profile:', err);
      setError(err instanceof Error ? err : new Error('Failed to update agent profile'));
      toast.error('Failed to update agent profile');
      return false;
    } finally {
      setUpdating(false);
    }
  };
  
  return { updateProfile, updating, error };
}

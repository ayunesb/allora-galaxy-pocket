
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { toast } from 'sonner';

export interface TeamMember {
  id: string;
  user_id: string;
  tenant_id: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
  profiles: {
    email: string;
    avatar_url?: string;
  };
}

export function useTeamManagement() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ['team-members', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      // First get the user_ids from tenant_user_roles
      const { data: teamRoles, error: rolesError } = await supabase
        .from('tenant_user_roles')
        .select('*')
        .eq('tenant_id', tenant.id);

      if (rolesError) throw rolesError;

      // Then get the user profiles for each user
      const userIds = teamRoles.map(role => role.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const members = teamRoles.map(role => {
        const profile = profiles.find(p => p.id === role.user_id);
        return {
          ...role,
          profiles: {
            email: profile?.email || 'No email',
            avatar_url: profile?.avatar_url
          }
        } as unknown as TeamMember;
      });

      return members as TeamMember[];
    },
    enabled: !!tenant?.id
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'editor' | 'viewer' }) => {
      if (!tenant?.id) throw new Error('No tenant selected');
      setIsProcessing(true);

      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success('Team member role updated');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Error updating member role:', error);
      toast.error('Failed to update member role');
      setIsProcessing(false);
    }
  });

  const removeMember = useMutation({
    mutationFn: async (userId: string) => {
      if (!tenant?.id) throw new Error('No tenant selected');
      setIsProcessing(true);

      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast.success('Team member removed');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member');
      setIsProcessing(false);
    }
  });

  return {
    teamMembers: teamMembers || [],
    isLoading: isLoading || isProcessing,
    updateMemberRole: updateMemberRole.mutate,
    removeMember: removeMember.mutate
  };
}

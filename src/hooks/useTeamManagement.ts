
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { toast } from 'sonner';
import { UserRole } from '@/types/invite';

export interface TeamMember {
  id: string;
  user_id: string;
  tenant_id: string;
  role: UserRole;
  created_at: string;
  profiles?: {
    email?: string;
    avatar_url?: string;
  };
}

export interface PendingInvite {
  id: string;
  email: string;
  role: UserRole;
  tenant_id: string;
  created_at: string;
  expires_at: string;
}

export function useTeamManagement() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch team members
  const { data: teamMembers, isLoading: isLoadingMembers } = useQuery({
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
      
      // Only proceed if we have user IDs
      if (!userIds.length) return [];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, avatar_url')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue with what we have, don't throw
      }

      // Map profile data safely
      const profileMap: Record<string, {email?: string, avatar_url?: string}> = {};
      
      // Only process profiles if we have valid data (not an error)
      if (profiles && !('error' in profiles)) {
        profiles.forEach(profile => {
          if (profile && profile.id) {
            profileMap[profile.id] = {
              email: profile.email || 'No email',
              avatar_url: profile.avatar_url
            };
          }
        });
      }

      // Combine the data safely
      const members = teamRoles.map(role => {
        const profileData = profileMap[role.user_id] || { email: 'Unknown email', avatar_url: null };
        
        return {
          ...role,
          profiles: profileData
        } as TeamMember;
      });

      return members;
    },
    enabled: !!tenant?.id
  });

  // Fetch pending invites
  const { data: pendingInvites, isLoading: isLoadingInvites } = useQuery({
    queryKey: ['pending-invites', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];

      // Use team_invites table
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('tenant_id', tenant.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      
      // Cast to the correct type to avoid recursion issues
      const safeData = data as unknown;
      return safeData as PendingInvite[];
    },
    enabled: !!tenant?.id
  });

  // Update member role
  const updateMemberRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
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

  // Remove team member
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

  // Invite team member
  const inviteTeamMember = async ({ email, role }: { email: string; role: UserRole }) => {
    if (!tenant?.id) {
      toast.error('No workspace selected');
      return false;
    }

    setIsProcessing(true);
    try {
      // Create expiration date (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Use team_invites table
      const { error } = await supabase
        .from('team_invites')
        .insert({
          tenant_id: tenant.id,
          email: email.toLowerCase().trim(),
          role,
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast.success(`Invitation sent to ${email}`);
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      return true;
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast.error('Failed to send invitation');
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    teamMembers: teamMembers || [],
    isLoading: isProcessing || isLoadingMembers || isLoadingInvites,
    isLoadingMembers,
    isLoadingInvites,
    updateMemberRole,
    updateRole: (userId: string, newRole: UserRole) => updateMemberRole.mutate({ userId, newRole }),
    removeMember: removeMember.mutate,
    pendingInvites: pendingInvites || [],
    inviteTeamMember
  };
}

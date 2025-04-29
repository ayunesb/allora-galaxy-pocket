
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { ToastService } from '@/services/ToastService'; 
import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@/types/invite';

// Updated TeamMember interface to match what's being used in components
export interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  created_at?: string;
  profiles: {
    id: string;
    email: string;
    avatar_url?: string | null;
  };
}

export function useTeamManagement() {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: members = [], refetch } = useQuery({
    queryKey: ['team-members', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at,
          profiles:user_id (
            id,
            email,
            avatar_url
          )
        `)
        .eq('tenant_id', tenant.id);
        
      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }
      
      // Safely map the results to our expected TeamMember format
      const teamMembers: TeamMember[] = data
        .filter(item => item.profiles) // Ensure the profile exists
        .map(item => {
          // Type assertion for profiles
          const profile = item.profiles as {
            id: string;
            email: string;
            avatar_url?: string | null;
          };
          
          if (!profile) {
            console.warn('Missing profile for user', item.user_id);
            return null;
          }
          
          return {
            id: item.id,
            user_id: item.user_id,
            role: item.role,
            created_at: item.created_at,
            profiles: profile
          };
        })
        .filter(Boolean) as TeamMember[]; // Filter out any null values
      
      return teamMembers;
    },
    enabled: !!tenant?.id
  });
  
  const inviteTeamMember = async (email: string, role = 'viewer') => {
    if (!tenant?.id) {
      ToastService.error('No workspace selected');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('team_invites')
        .insert({
          tenant_id: tenant.id,
          email: email.toLowerCase(),
          role: role as UserRole,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
      
      ToastService.success('Invitation sent!');
      return { success: true };
    } catch (error: any) {
      console.error('Failed to invite team member:', error);
      ToastService.error('Failed to send invitation');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateMemberRole = async (userId: string, newRole: UserRole) => {
    if (!tenant?.id) {
      ToastService.error('No workspace selected');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role: newRole })
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      ToastService.success('Role updated successfully');
      refetch();
      return { success: true };
    } catch (error: any) {
      console.error('Failed to update role:', error);
      ToastService.error('Failed to update role');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };
  
  const removeMember = async (userId: string) => {
    if (!tenant?.id) {
      ToastService.error('No workspace selected');
      return { success: false };
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('tenant_user_roles')
        .delete()
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      
      ToastService.success('Team member removed');
      refetch();
      return { success: true };
    } catch (error: any) {
      console.error('Failed to remove team member:', error);
      ToastService.error('Failed to remove team member');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    members,
    inviteTeamMember,
    updateMemberRole,
    removeMember,
    isLoading,
    refetch
  };
}

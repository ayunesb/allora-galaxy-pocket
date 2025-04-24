
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { toast } from "sonner";
import { UserRole } from "@/types/invite";

interface TeamMember {
  id: string;
  user_id: string;
  tenant_id: string;
  role: UserRole;
  profiles: {
    email: string;
  };
  created_at: string;
}

interface RoleUpdateParams {
  userId: string;
  role: UserRole;
}

interface InviteParams {
  email: string;
  role: UserRole;
}

export function useTeamManagement() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [isInviting, setIsInviting] = useState(false);
  
  // Fetch team members
  const { 
    data: teamMembers,
    isLoading: isLoadingMembers,
    error: teamError
  } = useQuery({
    queryKey: ['team-members', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select('*, profiles:user_id(*)')
        .eq('tenant_id', tenant.id);
      
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!tenant?.id
  });
  
  // Fetch pending invites
  const { 
    data: pendingInvites,
    isLoading: isLoadingInvites,
    error: invitesError
  } = useQuery({
    queryKey: ['pending-invites', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('tenant_id', tenant.id)
        .is('accepted_at', null);
      
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });
  
  // Update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: RoleUpdateParams) => {
      if (!tenant?.id) return false;
      
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role })
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      console.error("Error updating role:", error);
      toast.error("Failed to update role");
    }
  });
  
  // Invite team member
  const inviteTeamMember = async ({ email, role }: InviteParams) => {
    if (!tenant?.id || isInviting) return;
    
    setIsInviting(true);
    try {
      const { error } = await supabase
        .from('team_invites')
        .insert({
          tenant_id: tenant.id,
          email,
          role,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (error) throw error;
      
      // Refresh invites
      queryClient.invalidateQueries({ queryKey: ['pending-invites'] });
      
      toast.success(`Invitation sent to ${email}`);
    } catch (err) {
      console.error("Error inviting team member:", err);
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };
  
  return {
    teamMembers,
    isLoadingMembers,
    teamError,
    pendingInvites,
    isLoadingInvites,
    invitesError,
    updateRole: updateRoleMutation.mutate,
    inviteTeamMember,
    isInviting
  };
}

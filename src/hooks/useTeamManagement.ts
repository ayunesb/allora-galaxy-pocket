
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { UserRole } from "@/types/invite";

export function useTeamManagement() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: teamMembers, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['team-members', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('tenant_user_roles')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (
            email
          )
        `)
        .eq('tenant_id', tenant.id);

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  const { data: pendingInvites, isLoading: isLoadingInvites } = useQuery({
    queryKey: ['team-invites', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('tenant_id', tenant.id)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());

      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: UserRole }) => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      const { error } = await supabase
        .from('team_invites')
        .insert({
          email,
          role,
          tenant_id: tenant.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invites', tenant?.id] });
      toast("Team invitation sent successfully");
    },
    onError: (error) => {
      toast("Failed to send invitation");
      console.error("Invitation error:", error);
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      if (!tenant?.id) throw new Error("No tenant selected");
      
      const { error } = await supabase
        .from('tenant_user_roles')
        .update({ role })
        .eq('tenant_id', tenant.id)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members', tenant?.id] });
      toast("Role updated successfully");
    },
    onError: () => {
      toast("Failed to update role");
    }
  });

  return {
    teamMembers,
    pendingInvites,
    isLoadingMembers,
    isLoadingInvites,
    inviteTeamMember: inviteMutation.mutate,
    updateRole: updateRoleMutation.mutate
  };
}

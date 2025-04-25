
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface InviteType {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string | null;
}

export function PendingInvites() {
  const { tenant } = useTenant();
  
  const { data: invites, isLoading, error, refetch } = useQuery({
    queryKey: ['pending-invites', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('tenant_id', tenant.id)
        .is('accepted_at', null);
      
      if (error) throw error;
      return data as InviteType[];
    },
    enabled: !!tenant?.id
  });
  
  const handleRemoveInvite = async (inviteId: string) => {
    if (!tenant?.id) return;
    
    try {
      const { error } = await supabase
        .from('team_invites')
        .delete()
        .eq('id', inviteId)
        .eq('tenant_id', tenant.id);
      
      if (error) throw error;
      
      toast.success("Invitation removed successfully");
      refetch();
    } catch (error: any) {
      toast.error("Failed to remove invitation", {
        description: error.message
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 p-4 rounded-md text-sm text-destructive">
        Error loading pending invites
      </div>
    );
  }
  
  if (!invites?.length) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No pending invitations
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Pending Invitations</h3>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Sent</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell>{invite.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{invite.role}</Badge>
              </TableCell>
              <TableCell>{formatDistanceToNow(new Date(invite.created_at), { addSuffix: true })}</TableCell>
              <TableCell>
                {invite.expires_at ? formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true }) : 'Never'}
              </TableCell>
              <TableCell>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveInvite(invite.id)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

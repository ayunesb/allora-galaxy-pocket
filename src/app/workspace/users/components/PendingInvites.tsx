
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';
import { toast } from '@/components/ui/sonner';
import { TrashIcon, MailIcon, Clock } from 'lucide-react';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { format, isPast } from 'date-fns';

export interface PendingInvite {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

export function PendingInvites() {
  const { tenant } = useTenant();
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchInvites = async () => {
    if (!tenant?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('team_invites')
        .select('*')
        .eq('tenant_id', tenant.id)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setInvites(data);
    } catch (err: any) {
      console.error('Error fetching invites:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (tenant) {
      fetchInvites();
    }
  }, [tenant]);
  
  const handleResendInvite = async (inviteId: string, email: string) => {
    try {
      // In a real app, this would call an API endpoint to resend the invitation email
      // For now, we'll just show a toast
      toast.success('Invitation resent', {
        description: `Invitation has been resent to ${email}`,
      });
    } catch (error: any) {
      toast.error('Failed to resend invitation');
    }
  };
  
  const handleCancelInvite = async (inviteId: string, email: string) => {
    try {
      const { error } = await supabase
        .from('team_invites')
        .delete()
        .eq('id', inviteId);
      
      if (error) throw error;
      
      toast.success('Invitation cancelled', {
        description: `Invitation to ${email} has been cancelled`,
      });
      
      setInvites(invites.filter(invite => invite.id !== inviteId));
    } catch (error: any) {
      toast.error('Failed to cancel invitation', {
        description: error.message,
      });
    }
  };
  
  const isExpired = (expiresAt: string) => {
    return isPast(new Date(expiresAt));
  };
  
  if (isLoading) {
    return <LoadingState message="Loading pending invitations..." />;
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={fetchInvites} />;
  }
  
  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={fetchInvites}>
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
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.length > 0 ? (
            invites.map((invite) => (
              <TableRow key={invite.id}>
                <TableCell>{invite.email}</TableCell>
                <TableCell>
                  <Badge variant="outline">{invite.role}</Badge>
                </TableCell>
                <TableCell>{format(new Date(invite.created_at), 'PP')}</TableCell>
                <TableCell>
                  {isExpired(invite.expires_at) ? (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expired
                    </Badge>
                  ) : (
                    format(new Date(invite.expires_at), 'PP')
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      size="icon" 
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => handleResendInvite(invite.id, invite.email)}
                      title="Resend invitation"
                    >
                      <MailIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleCancelInvite(invite.id, invite.email)}
                      title="Cancel invitation"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No pending invitations
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}

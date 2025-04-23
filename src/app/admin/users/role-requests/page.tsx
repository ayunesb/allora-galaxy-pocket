
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

type RoleChangeRequest = {
  id: string;
  user_id: string;
  requested_role: string;
  reason: string;
  created_at: string;
  user_email?: string;
};

export default function RoleChangeRequestsPage() {
  const [requests, setRequests] = useState<RoleChangeRequest[]>([]);
  const { user: adminUser } = useAuth();

  useEffect(() => {
    fetchRoleChangeRequests();
  }, []);

  const fetchRoleChangeRequests = async () => {
    const { data, error } = await supabase
      .from('role_change_requests')
      .select('*')
      .eq('approved', false);

    if (error) {
      toast.error('Failed to fetch role change requests');
      return;
    }

    // Fetch emails for each request
    const requestsWithEmails = await Promise.all(
      data.map(async (request) => {
        const { data: userData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', request.user_id)
          .single();
        return { ...request, user_email: userData?.email };
      })
    );

    setRequests(requestsWithEmails);
  };

  const handleRequestAction = async (request: RoleChangeRequest, approved: boolean) => {
    if (!adminUser) return;

    try {
      // Update role change request
      const { error: requestError } = await supabase
        .from('role_change_requests')
        .update({ 
          approved, 
          reviewed_by: adminUser.id 
        })
        .eq('id', request.id);

      if (requestError) throw requestError;

      // If approved, update user's role
      if (approved) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: request.requested_role })
          .eq('user_id', request.user_id);

        if (roleError) throw roleError;
      }

      toast.success(`Role change request ${approved ? 'approved' : 'rejected'}`);
      
      // Refresh requests
      fetchRoleChangeRequests();
    } catch (error) {
      toast.error('Failed to process request', {
        description: error instanceof Error ? error.message : String(error)
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Role Change Requests</h1>
      {requests.length === 0 ? (
        <p className="text-muted-foreground">No pending role change requests</p>
      ) : (
        requests.map((request) => (
          <Card key={request.id} className="mb-4">
            <CardHeader>
              <CardTitle>Role Change Request</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p><strong>User Email:</strong> {request.user_email}</p>
                <p><strong>Requested Role:</strong> {request.requested_role}</p>
                <p><strong>Reason:</strong> {request.reason}</p>
                <p><strong>Requested At:</strong> {format(new Date(request.created_at), 'PPpp')}</p>
                
                <div className="flex space-x-4">
                  <Button 
                    variant="default" 
                    onClick={() => handleRequestAction(request, true)}
                  >
                    Approve
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleRequestAction(request, false)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

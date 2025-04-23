
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import AdminOnly from '@/guards/AdminOnly';

type RoleChangeRequest = {
  id: string;
  user_id: string;
  requested_role: string;
  reason: string;
  created_at: string;
  user_email?: string;
  trust_score?: number;
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

    // Fetch emails and trust scores for each request
    const requestsWithDetails = await Promise.all(
      data.map(async (request) => {
        // Get user email
        const { data: userData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', request.user_id)
          .single();
        
        // Get user trust score
        const { data: trustData } = await supabase
          .from('user_roles')
          .select('trust_score')
          .eq('user_id', request.user_id)
          .single();
        
        return { 
          ...request, 
          user_email: userData?.email,
          trust_score: trustData?.trust_score || 0
        };
      })
    );

    setRequests(requestsWithDetails);
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
        // Get previous role first
        const { data: previousRoleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', request.user_id)
          .single();
        
        const previousRole = previousRoleData?.role;
        
        // Update user's role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: request.requested_role })
          .eq('user_id', request.user_id);

        if (roleError) throw roleError;
        
        // Log the role change
        const { error: logError } = await supabase
          .from('role_change_logs')
          .insert({
            user_id: request.user_id,
            changed_by: adminUser.id,
            previous_role: previousRole,
            new_role: request.requested_role,
            reason: `Admin approval of request: ${request.reason}`
          });
          
        if (logError) {
          console.warn("Could not log role change:", logError);
        }
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

  // Auto-approve eligible requests based on trust score
  const checkForAutoApprovals = async () => {
    const eligibleRequests = requests.filter(
      req => req.trust_score && req.trust_score >= 30 && req.requested_role === 'developer'
    );
    
    for (const request of eligibleRequests) {
      await handleRequestAction(request, true);
      toast.info(`Request from ${request.user_email} was auto-approved based on trust score`);
    }
  };

  useEffect(() => {
    // Run auto-approval check when requests are loaded
    if (requests.length > 0) {
      checkForAutoApprovals();
    }
  }, [requests]);

  return (
    <AdminOnly>
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
                  <p><strong>Trust Score:</strong> {request.trust_score || 0} 
                    {(request.trust_score || 0) >= 30 && 
                     <span className="ml-2 text-green-600">(Eligible for auto-approval)</span>}
                  </p>
                  
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
    </AdminOnly>
  );
}


import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RoleChangeRequestForm() {
  const { user } = useAuth();
  const [requestedRole, setRequestedRole] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !requestedRole || !reason) {
      toast.error('Please fill out all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('role_change_requests').insert({
        user_id: user.id,
        requested_role: requestedRole,
        reason
      });

      if (error) throw error;

      toast.success('Role change request submitted successfully');
      setRequestedRole('');
      setReason('');
    } catch (error) {
      toast.error('Failed to submit role change request', {
        description: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Role Change</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Select Desired Role</label>
          <Select value={requestedRole} onValueChange={setRequestedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="developer">Developer</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Reason for Request</label>
          <Textarea 
            placeholder="Explain why you need this role change" 
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting || !requestedRole || !reason}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Role Change Request'}
        </Button>
      </CardContent>
    </Card>
  );
}

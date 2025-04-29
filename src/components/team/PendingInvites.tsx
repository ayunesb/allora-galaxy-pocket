import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTeamManagement } from '@/hooks/useTeamManagement';

export function PendingInvites() {
  const { members, isLoading } = useTeamManagement();
  // Either implement pendingInvites functionality or handle empty invites
  const pendingInvites = []; // Replace with actual implementation if available
  const isLoadingInvites = isLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invites</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingInvites ? (
          <p>Loading invites...</p>
        ) : pendingInvites.length > 0 ? (
          <ul>
            {pendingInvites.map((invite) => (
              <li key={invite.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={invite.avatar} alt={invite.email} />
                    <AvatarFallback>{invite.email[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{invite.email}</p>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Resend
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending invites.</p>
        )}
      </CardContent>
    </Card>
  );
}


import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { toast } from 'sonner';
import { UserRole } from '@/types/invite';

export interface InviteMemberFormProps {
  role: UserRole;
}

export function InviteMemberForm({ role }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { inviteTeamMember } = useTeamManagement();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Email is required");
      return;
    }
    
    setIsSubmitting(true);
    const result = await inviteTeamMember(email, role);
    
    if (result?.error) {
      toast.error(result.error.message || "Failed to invite member");
    } else {
      toast.success("Invitation sent successfully");
      setEmail('');
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          placeholder="Enter email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Inviting..." : "Invite Member"}
      </Button>
    </form>
  );
}

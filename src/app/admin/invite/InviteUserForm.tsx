
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { UserRole } from "@/types/invite";

export default function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("editor");
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();

  const handleInvite = async () => {
    if (!email || !role || !tenant) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('team_invites')
        .insert({
          email,
          role,
          tenant_id: tenant.id,
        });

      if (error) throw error;
      
      toast.success("Invite sent successfully!");
      setEmail("");
    } catch (error: any) {
      toast.error("Failed to send invite", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Invite Team Member</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Select
            value={role}
            onValueChange={(value) => setRole(value as UserRole)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          className="w-full" 
          onClick={handleInvite}
          disabled={!email || !role || isLoading}
        >
          {isLoading ? "Sending..." : "Send Invite"}
        </Button>
      </CardContent>
    </Card>
  );
}

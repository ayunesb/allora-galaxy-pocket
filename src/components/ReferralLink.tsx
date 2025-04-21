
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { createReferral } from "@/lib/referrals/referralUtils";

export default function ReferralLink() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!user?.id || !email) return;

    setIsLoading(true);
    try {
      const { error } = await createReferral({
        referrer_user_id: user.id,
        referred_user_email: email,
      });

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/onboarding?ref=${user.id}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(inviteUrl);
      
      toast.success("Referral link copied to clipboard!", {
        description: "Share it with your friend to invite them.",
      });
      
      setEmail("");
    } catch (error: any) {
      toast.error("Failed to create referral", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Friend's email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleInvite} disabled={isLoading || !email}>
          {isLoading ? "Creating..." : "Invite Friend"}
        </Button>
      </div>
    </div>
  );
}

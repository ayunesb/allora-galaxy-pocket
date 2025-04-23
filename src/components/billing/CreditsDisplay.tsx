
import { Progress } from "@/components/ui/progress";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

export function CreditsDisplay() {
  const { profile, isLoading } = useBillingProfile();

  if (isLoading) {
    return (
      <div className="mt-4 px-4">
        <Progress value={0} className="h-2" />
        <p className="text-xs mt-1">Loading credits...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const credits = profile.credits;
  const monthlyCredits = profile.plan === 'standard' ? 100 : profile.plan === 'growth' ? 500 : 1000;
  const used = monthlyCredits - credits;
  const percentUsed = (used / monthlyCredits) * 100;
  const isLowCredits = credits < monthlyCredits * 0.1;

  return (
    <div className="mt-4 px-4">
      <p className="text-xs text-muted-foreground">Credits Used</p>
      <Progress value={percentUsed} className="h-2" />
      <p className="text-xs mt-1">{credits} / {monthlyCredits} remaining</p>
      {isLowCredits && (
        <div className="mt-2">
          <p className="text-xs text-yellow-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Low credits — consider upgrading
          </p>
          <Button asChild variant="ghost" size="sm" className="mt-2 w-full">
            <Link to="/pricing">Upgrade Plan</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

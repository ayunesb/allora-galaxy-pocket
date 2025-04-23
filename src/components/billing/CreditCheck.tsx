
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CreditCheckProps {
  children: React.ReactNode;
  requiredCredits?: number;
}

export function CreditCheck({ children, requiredCredits = 10 }: CreditCheckProps) {
  const { profile, isLoading } = useBillingProfile();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile || profile.credits === 0) {
    return (
      <div className="p-6 border rounded-md text-center">
        <h2 className="text-lg font-semibold text-red-600">🚫 You're out of credits!</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Upgrade your plan or wait until your monthly reset.
        </p>
        <Button asChild className="mt-4">
          <Link to="/pricing">🔼 Upgrade Plan</Link>
        </Button>
      </div>
    );
  }

  if (profile.credits < requiredCredits) {
    return (
      <div className="p-6 border rounded-md text-center">
        <h2 className="text-lg font-semibold text-yellow-600">⚠️ Low Credits Warning</h2>
        <p className="text-sm text-muted-foreground mt-2">
          You need at least {requiredCredits} credits to proceed.
        </p>
        <Button asChild className="mt-4">
          <Link to="/pricing">Upgrade Plan</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}

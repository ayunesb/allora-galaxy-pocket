
import { ReactNode, useEffect, useState } from "react";
import { useCreditsManager } from "@/hooks/useCreditsManager";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, CreditCard } from "lucide-react";
import { useStripeUsageReporting } from "@/hooks/useStripeUsageReporting";

interface CreditCheckProps {
  children: ReactNode;
  requiredCredits: number;
  onInsufficientCredits?: () => void;
  featureName?: string;
}

export function CreditCheck({
  children,
  requiredCredits,
  onInsufficientCredits,
  featureName = "this feature"
}: CreditCheckProps) {
  const [hasChecked, setHasChecked] = useState(false);
  const { hasEnoughCredits, currentCredits } = useCreditsManager();
  const { createCheckoutSession } = useStripeUsageReporting();
  const [hasCredits, setHasCredits] = useState(true);

  useEffect(() => {
    // Check if the user has enough credits
    const hasEnough = hasEnoughCredits(requiredCredits);
    setHasCredits(hasEnough);
    setHasChecked(true);
    
    if (!hasEnough && onInsufficientCredits) {
      onInsufficientCredits();
    }
  }, [requiredCredits, hasEnoughCredits, onInsufficientCredits]);

  const handleUpgrade = async () => {
    const url = await createCheckoutSession();
    if (url) window.location.href = url;
  };

  if (!hasChecked) {
    return null; // Don't render anything until we've checked credit status
  }

  if (!hasCredits) {
    return (
      <Card className="p-6">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Insufficient Credits</AlertTitle>
          <AlertDescription>
            You need at least {requiredCredits} credits to use {featureName}.
            You currently have {currentCredits} credits.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col space-y-4">
          <p className="text-sm text-muted-foreground">
            Purchase more credits or upgrade your plan to continue.
          </p>
          
          <Button onClick={handleUpgrade}>
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>
      </Card>
    );
  }

  return <>{children}</>;
}

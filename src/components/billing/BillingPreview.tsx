
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useStripeUsageReporting } from "@/hooks/useStripeUsageReporting";
import { formatDistanceToNow } from "date-fns";

export function BillingPreview() {
  const { user } = useAuth();
  const { profile, isLoading, error } = useBillingProfile();
  const { getSubscriptionDetails, createCheckoutSession } = useStripeUsageReporting();
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  console.log("BillingPreview data:", { profile, isLoading, error, user });

  useEffect(() => {
    // Only check subscription if we have a profile with a subscription ID
    if (profile?.stripe_subscription_id) {
      checkSubscriptionStatus();
    }
  }, [profile?.stripe_subscription_id]);

  const checkSubscriptionStatus = async () => {
    setIsCheckingSubscription(true);
    try {
      const details = await getSubscriptionDetails();
      setSubscriptionDetails(details);
    } catch (err) {
      console.error("Failed to fetch subscription details:", err);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  const handleUpgrade = async () => {
    const url = await createCheckoutSession('standard');
    if (url) {
      window.location.href = url;
    }
  };

  if (!user) {
    return null; // Don't show billing preview if not logged in
  }

  if (isLoading || isCheckingSubscription) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load billing profile
        </AlertDescription>
      </Alert>
    );
  }

  // Even if profile is null, we'll still render something
  const displayPlan = profile?.plan 
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) 
    : 'Standard';
  
  const displayCredits = profile?.credits ?? 0;
  const hasActiveSubscription = !!subscriptionDetails?.status && subscriptionDetails.status === 'active';
  const renewalDate = subscriptionDetails?.current_period_end 
    ? formatDistanceToNow(new Date(subscriptionDetails.current_period_end), { addSuffix: true })
    : null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayCredits}</div>
        <p className="text-xs text-muted-foreground">
          {displayPlan} Plan
          {hasActiveSubscription && renewalDate && (
            <> • Renews {renewalDate}</>
          )}
        </p>
        
        {!hasActiveSubscription && !profile?.stripe_subscription_id && (
          <Button 
            onClick={handleUpgrade}
            size="sm"
            className="mt-4 w-full"
            variant="outline"
          >
            Upgrade to Subscription
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

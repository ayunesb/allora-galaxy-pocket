
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function BillingPreview() {
  const { data: profile, isLoading, error } = useBillingProfile();

  console.log("BillingPreview data:", { profile, isLoading, error });

  if (isLoading) {
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
        </p>
      </CardContent>
    </Card>
  );
}

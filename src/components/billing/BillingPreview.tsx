
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard } from "lucide-react";
import { useBillingProfile } from "@/hooks/useBillingProfile";

export function BillingPreview() {
  const { data: profile, isLoading } = useBillingProfile();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{profile?.credits ?? 0}</div>
        <p className="text-xs text-muted-foreground">
          {profile?.plan?.charAt(0).toUpperCase() + profile?.plan?.slice(1) ?? 'Standard'} Plan
        </p>
      </CardContent>
    </Card>
  );
}


import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useTenant } from "@/hooks/useTenant";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { BillingPreview } from "@/components/billing/BillingPreview";

interface BillingStats {
  usage: number;
  limit: number;
  plan: "Free" | "Pro" | "Enterprise";
}

export default function BillingPanel() {
  const { tenant } = useTenant();
  const [showDetails, setShowDetails] = useState(false);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["billing", tenant?.id],
    queryFn: async (): Promise<BillingStats> => {
      console.log("Fetching billing stats for tenant:", tenant?.id);

      if (!tenant?.id) {
        console.log("No tenant ID available");
        return { usage: 0, limit: 100, plan: "Free" };
      }

      try {
        const { data, error } = await supabase
          .from("tenant_profiles")
          .select("usage_credits")
          .eq("id", tenant.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching billing data:", error);
          throw error;
        }

        console.log("Billing data retrieved:", data);
        return {
          usage: 100 - (data?.usage_credits || 0),
          limit: 100,
          plan: "Free"
        };
      } catch (fetchError) {
        console.error("Failed to fetch billing data:", fetchError);
        throw fetchError;
      }
    }
  });

  // Calculate usage percentage safely
  const usagePercent = stats ? ((stats.usage || 0) / (stats.limit || 1)) * 100 : 0;

  // If there's no tenant loaded yet, show a loading state
  if (!tenant && !error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">💳 Billing & Usage</CardTitle>
          <CardDescription>Loading workspace information...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // If there's an error loading data, show error state
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-md mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Failed to load billing information</AlertTitle>
        <AlertDescription>
          <p className="mb-4">There was an error loading your billing information.</p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <span>💳</span>
            <span>Billing & Usage</span>
          </CardTitle>
          <CardDescription>
            Manage your subscription and view usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Current Plan:</span>
            <span className="font-medium">
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Loading...
                </span>
              ) : (
                stats?.plan || "Free"
              )}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Strategy Credits Used:</span>
              <span className="font-medium">
                {isLoading ? (
                  <Loader2 className="h-3 w-3 inline mr-1 animate-spin" />
                ) : (
                  `${stats?.usage || 0} / ${stats?.limit || 0}`
                )}
              </span>
            </div>
            <Progress value={isLoading ? 0 : usagePercent} className="h-2" />
          </div>

          <Button className="w-full bg-green-600 hover:bg-green-700">
            Upgrade Plan
          </Button>

          {showDetails && <BillingPreview />}
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDetails(prev => !prev)}
          >
            {showDetails ? "Hide Details" : "Show More Details"}
          </Button>
        </CardFooter>
      </Card>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Payment Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Add or manage your payment methods
          </p>
          <Button variant="outline" className="w-full">
            Manage Payment Methods
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg">Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            View your past invoices and payment history
          </p>
          <Button variant="outline" className="w-full">
            View Billing History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

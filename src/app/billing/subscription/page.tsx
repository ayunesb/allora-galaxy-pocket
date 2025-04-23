
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, CreditCard, Shield } from "lucide-react";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

export default function SubscriptionManagement() {
  const { profile, isLoading, error } = useBillingProfile();
  
  const handleCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) {
        toast.error("Failed to open customer portal", {
          description: error.message
        });
        return;
      }
      
      // Redirect to Stripe customer portal
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
      toast.error("Something went wrong", {
        description: "Please try again later"
      });
    }
  };
  
  const checkSubscription = async () => {
    try {
      const { error } = await supabase.functions.invoke("check-subscription");
      
      if (!error) {
        toast.success("Subscription status updated", {
          description: "Your subscription information has been refreshed."
        });
      } else {
        toast.error("Failed to check subscription status");
      }
    } catch (err) {
      console.error("Error checking subscription:", err);
      toast.error("Failed to refresh subscription status");
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-center">
            <div className="h-8 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading subscription</AlertTitle>
          <AlertDescription>
            We couldn't load your subscription information. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Format plan name for display
  const planDisplay = profile?.plan 
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) 
    : 'Standard';
  
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Subscription Management</h1>
          <p className="text-muted-foreground">Manage your subscription plan and payment details</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={checkSubscription}>
            Refresh Status
          </Button>
        </div>
      </div>
      
      <Card className="border-primary/50">
        <CardHeader className="bg-primary/5">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{planDisplay} Plan</CardTitle>
              <CardDescription>Active subscription</CardDescription>
            </div>
            <div className="bg-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium">
              Current Plan
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly fee</span>
              <span className="font-medium">
                {profile?.plan === 'standard' ? '$19.99/month' : 
                 profile?.plan === 'growth' ? '$49.99/month' : '$99.99/month'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Billing period</span>
              <span className="font-medium">Monthly</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly credits</span>
              <span className="font-medium">
                {profile?.plan === 'standard' ? '100 credits' : 
                 profile?.plan === 'growth' ? '500 credits' : '1000 credits'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining credits</span>
              <span className="font-medium">{profile?.credits || 0} credits</span>
            </div>
            
            <Separator />
            
            <div className="pt-2">
              <h3 className="font-medium mb-3">Plan Features</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" /> 
                  <span>
                    {profile?.plan === 'standard' ? '100 monthly credits' : 
                     profile?.plan === 'growth' ? '500 monthly credits' : '1000 monthly credits'}
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>
                    {profile?.plan === 'standard' ? 'Basic support' : 
                     profile?.plan === 'growth' ? 'Priority support' : '24/7 support'}
                  </span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                  <span>
                    {profile?.plan === 'standard' ? '5 workspaces' : 
                     profile?.plan === 'growth' ? '15 workspaces' : 'Unlimited workspaces'}
                  </span>
                </li>
                {profile?.plan !== 'standard' && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Advanced analytics</span>
                  </li>
                )}
                {profile?.plan === 'pro' && (
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    <span>Custom integrations</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t space-y-4">
            <Button 
              onClick={handleCustomerPortal}
              className="w-full md:w-auto"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Subscription
            </Button>
            
            <p className="text-sm text-muted-foreground">
              You'll be redirected to Stripe to manage your subscription details securely.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Security</CardTitle>
          <CardDescription>Your payment information is secure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Shield className="h-10 w-10 text-green-500 shrink-0" />
            <div>
              <h3 className="font-medium">Secure Payment Processing</h3>
              <p className="text-sm text-muted-foreground mt-1">
                We use Stripe for secure payment processing. Your payment details are never stored on our servers and all transactions are encrypted.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

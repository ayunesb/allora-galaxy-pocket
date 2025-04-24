
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { BillingPreview } from "@/components/billing/BillingPreview";
import { CreditsDisplay } from "@/components/billing/CreditsDisplay";
import { CheckCircle, CreditCard, ExternalLink, BarChart, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCreditsManager } from "@/hooks/useCreditsManager";

// Define plan features for each tier
const planFeatures = {
  standard: [
    "100 monthly credits",
    "Basic strategy creation", 
    "Core analytics",
    "Community support"
  ],
  growth: [
    "500 monthly credits",
    "Advanced strategies",
    "Recovery planning",
    "Email support",
    "Export functionality"
  ],
  pro: [
    "1000 monthly credits",
    "All Growth features",
    "AI-powered analytics",
    "Priority support",
    "Custom reporting",
    "Unlimited exports"
  ]
};

// Plan pricing
const planPricing = {
  standard: {
    monthly: 19.99,
    yearly: 199.90, // 2 months free
  },
  growth: {
    monthly: 49.99,
    yearly: 499.90, // 2 months free
  },
  pro: {
    monthly: 99.99,
    yearly: 999.90, // 2 months free
  }
};

export default function BillingDashboard() {
  const { profile, isLoading } = useBillingProfile();
  const { getRemainingCredits } = useCreditsManager();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = React.useState(false);

  const handleCheckout = async (plan: string) => {
    if (isCheckingOut) return;
    setIsCheckingOut(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Checkout failed", { description: "No checkout URL returned" });
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Checkout error", { description: "Failed to start checkout process" });
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  const handleOpenCustomerPortal = async () => {
    if (isOpeningPortal) return;
    setIsOpeningPortal(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Portal access failed", { description: "Could not access customer portal" });
      }
    } catch (err) {
      console.error("Customer portal error:", err);
      toast.error("Portal error", { description: "Failed to open customer portal" });
    } finally {
      setIsOpeningPortal(false);
    }
  };
  
  // Check subscription status
  const { isLoading: isCheckingSubscription } = useQuery({
    queryKey: ['subscription-check'],
    queryFn: async () => {
      try {
        await supabase.functions.invoke('check-subscription');
        return true;
      } catch (err) {
        console.error("Subscription check error:", err);
        return false;
      }
    },
    // Check on page load and every 10 seconds
    refetchInterval: 10000,
  });
  
  // Current plan name formatted for display
  const currentPlan = profile?.plan 
    ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1)
    : 'Standard';

  // Credit info
  const availableCredits = getRemainingCredits();
  const creditStatus = React.useMemo(() => {
    const planCredits = profile?.plan === 'standard' ? 100 : 
                       profile?.plan === 'growth' ? 500 : 1000;
    const percent = availableCredits / planCredits;
    
    if (percent < 0.1) return 'critical';
    if (percent < 0.25) return 'low';
    return 'good';
  }, [profile?.plan, availableCredits]);

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Billing & Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription, check credit balance, and view billing history
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="outline"
            onClick={handleOpenCustomerPortal}
            disabled={isOpeningPortal || !profile?.stripe_customer_id}
          >
            {isOpeningPortal ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="mr-2 h-4 w-4" />
            )}
            Manage Payment Methods
          </Button>
          
          <Button asChild>
            <Link to="/billing/history">
              <BarChart className="mr-2 h-4 w-4" />
              View History
            </Link>
          </Button>
        </div>
      </div>
      
      {isLoading || isCheckingSubscription ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading billing information...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Credits Status */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Credit Status</CardTitle>
                {creditStatus === 'critical' && (
                  <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                    Low Credits
                  </div>
                )}
              </div>
              <CardDescription>
                Your available credits for this billing period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <CreditsDisplay />
                  
                  <div className="mt-4">
                    <Button 
                      className="w-full" 
                      onClick={() => handleCheckout(profile?.plan || 'standard')}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="mr-2 h-4 w-4" />
                      )}
                      {profile?.stripe_subscription_id 
                        ? 'Upgrade Plan' 
                        : 'Subscribe Now'}
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium mb-2">Current Plan: <span className="text-primary">{currentPlan}</span></h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your current billing period credits
                  </p>
                  
                  <ul className="space-y-2">
                    {planFeatures[profile?.plan || 'standard'].map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Subscription Plans */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
            
            <Tabs defaultValue="monthly">
              <div className="flex justify-end mb-2">
                <TabsList>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly">Yearly (Save 16%)</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="monthly" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Standard Plan */}
                  <Card className={`overflow-hidden ${profile?.plan === 'standard' ? 'border-primary border-2' : ''}`}>
                    {profile?.plan === 'standard' && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
                        CURRENT PLAN
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>Standard</CardTitle>
                      <CardDescription>For individuals and small teams</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">${planPricing.standard.monthly}</span>
                        <span className="text-muted-foreground ml-1">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {planFeatures.standard.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        onClick={() => handleCheckout('standard')}
                        disabled={isCheckingOut || profile?.plan === 'standard'}
                      >
                        {profile?.plan === 'standard' ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Growth Plan */}
                  <Card className={`overflow-hidden ${profile?.plan === 'growth' ? 'border-primary border-2' : ''}`}>
                    {profile?.plan === 'growth' && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
                        CURRENT PLAN
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>Growth</CardTitle>
                      <CardDescription>For growing businesses</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">${planPricing.growth.monthly}</span>
                        <span className="text-muted-foreground ml-1">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {planFeatures.growth.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        onClick={() => handleCheckout('growth')}
                        variant={profile?.plan === 'standard' ? 'default' : profile?.plan === 'growth' ? 'outline' : 'default'}
                        disabled={isCheckingOut || profile?.plan === 'growth'}
                      >
                        {profile?.plan === 'growth' ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Pro Plan */}
                  <Card className={`overflow-hidden ${profile?.plan === 'pro' ? 'border-primary border-2' : ''}`}>
                    {profile?.plan === 'pro' && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
                        CURRENT PLAN
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>Pro</CardTitle>
                      <CardDescription>For larger organizations</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">${planPricing.pro.monthly}</span>
                        <span className="text-muted-foreground ml-1">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {planFeatures.pro.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        onClick={() => handleCheckout('pro')}
                        disabled={isCheckingOut || profile?.plan === 'pro'}
                      >
                        {profile?.plan === 'pro' ? 'Current Plan' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Yearly Plans Tab */}
              <TabsContent value="yearly" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Standard Plan Yearly */}
                  <Card className={`overflow-hidden ${profile?.plan === 'standard' ? 'border-primary border-2' : ''}`}>
                    {profile?.plan === 'standard' && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
                        CURRENT PLAN
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>Standard</CardTitle>
                      <CardDescription>For individuals and small teams</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">${planPricing.standard.yearly / 12}</span>
                        <span className="text-muted-foreground ml-1">/month</span>
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Billed ${planPricing.standard.yearly}/year
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {planFeatures.standard.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        onClick={() => handleCheckout('standard-yearly')}
                        disabled={isCheckingOut}
                      >
                        Select Yearly Plan
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Growth Plan Yearly */}
                  <Card className={`overflow-hidden ${profile?.plan === 'growth' ? 'border-primary border-2' : ''}`}>
                    {profile?.plan === 'growth' && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
                        CURRENT PLAN
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>Growth</CardTitle>
                      <CardDescription>For growing businesses</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">${planPricing.growth.yearly / 12}</span>
                        <span className="text-muted-foreground ml-1">/month</span>
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Billed ${planPricing.growth.yearly}/year
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {planFeatures.growth.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        onClick={() => handleCheckout('growth-yearly')}
                        disabled={isCheckingOut}
                      >
                        Select Yearly Plan
                      </Button>
                    </CardContent>
                  </Card>
                  
                  {/* Pro Plan Yearly */}
                  <Card className={`overflow-hidden ${profile?.plan === 'pro' ? 'border-primary border-2' : ''}`}>
                    {profile?.plan === 'pro' && (
                      <div className="bg-primary text-primary-foreground text-center py-1 text-xs font-medium">
                        CURRENT PLAN
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle>Pro</CardTitle>
                      <CardDescription>For larger organizations</CardDescription>
                      <div className="mt-4">
                        <span className="text-3xl font-bold">${planPricing.pro.yearly / 12}</span>
                        <span className="text-muted-foreground ml-1">/month</span>
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Billed ${planPricing.pro.yearly}/year
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {planFeatures.pro.map((feature, idx) => (
                          <li key={idx} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        onClick={() => handleCheckout('pro-yearly')}
                        disabled={isCheckingOut}
                      >
                        Select Yearly Plan
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">When are credits renewed?</h3>
                <p className="text-sm text-muted-foreground">
                  Credits are renewed at the start of each billing cycle when your subscription renews.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">How do I cancel my subscription?</h3>
                <p className="text-sm text-muted-foreground">
                  You can cancel your subscription anytime through the Stripe Customer Portal.
                  Click the "Manage Payment Methods" button above to access it.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium">What happens to my data if I downgrade?</h3>
                <p className="text-sm text-muted-foreground">
                  Your data remains intact when you downgrade, but you may lose access to premium features
                  that were included in your previous plan.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Support Section */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground">
                Contact our support team if you have any questions about billing or subscriptions.
              </p>
              <Button asChild>
                <Link to="/support">
                  Contact Support <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

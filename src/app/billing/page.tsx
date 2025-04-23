
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CreditCard, DollarSign, Download, LineChart, RefreshCw, Settings } from "lucide-react";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { CreditsDisplay } from "@/components/billing/CreditsDisplay";
import { BillingPreview } from "@/components/billing/BillingPreview";
import { useStripeUsageReporting } from "@/hooks/useStripeUsageReporting";
import { supabase } from "@/integrations/supabase/client";

export default function BillingDashboard() {
  const { profile, isLoading, addCredits, updatePlan } = useBillingProfile();
  const { user } = useAuth();
  const { reportCreditUsage } = useStripeUsageReporting();
  
  const handleCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      
      if (error) {
        toast.error("Failed to start checkout", {
          description: error.message
        });
        return;
      }
      
      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      toast.error("Something went wrong", {
        description: "Please try again later"
      });
    }
  };
  
  const handlePortal = async () => {
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
      toast.error("Something went wrong", {
        description: "Please try again later"
      });
    }
  };

  const getPlanDetails = (planName: string) => {
    switch (planName) {
      case 'standard':
        return { 
          name: 'Standard',
          price: '$19.99/month',
          features: ['100 monthly credits', 'Basic support', '5 workspaces'],
          credits: 100
        };
      case 'growth':
        return { 
          name: 'Growth',
          price: '$49.99/month',
          features: ['500 monthly credits', 'Priority support', '15 workspaces', 'Advanced analytics'],
          credits: 500
        };
      case 'pro':
        return { 
          name: 'Professional',
          price: '$99.99/month',
          features: ['1000 monthly credits', '24/7 support', 'Unlimited workspaces', 'Custom integrations'],
          credits: 1000
        };
      default:
        return { 
          name: 'Standard',
          price: '$19.99/month',
          features: ['100 monthly credits', 'Basic support', '5 workspaces'],
          credits: 100
        };
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
          <p className="text-muted-foreground">Manage your subscription and payment details</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <Button variant="outline" onClick={handlePortal}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Subscription
          </Button>
          <Button onClick={handleCheckout}>
            <CreditCard className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="subscription">
            <TabsList className="mb-4">
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="usage">Credit Usage</TabsTrigger>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    You are currently on the {profile?.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : 'Standard'} plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    {['standard', 'growth', 'pro'].map((plan) => {
                      const planDetails = getPlanDetails(plan);
                      const isCurrentPlan = profile?.plan === plan;
                      
                      return (
                        <Card 
                          key={plan} 
                          className={`${isCurrentPlan ? 'border-primary shadow-md' : ''}`}
                        >
                          <CardHeader className={`${isCurrentPlan ? 'bg-primary/5' : ''} pb-2`}>
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-xl">{planDetails.name}</CardTitle>
                              {isCurrentPlan && (
                                <span className="bg-primary/20 text-primary text-xs font-semibold px-2 py-1 rounded-full">
                                  Current
                                </span>
                              )}
                            </div>
                            <CardDescription className="text-lg font-bold">
                              {planDetails.price}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <ul className="space-y-2 mb-4">
                              {planDetails.features.map((feature, i) => (
                                <li key={i} className="flex items-start">
                                  <span className="text-green-600 mr-2">✓</span>
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                            {!isCurrentPlan && (
                              <Button 
                                className="w-full" 
                                variant={plan === 'standard' ? 'outline' : 'default'}
                                onClick={() => {
                                  if (plan === 'standard') {
                                    updatePlan.mutate('standard');
                                  } else {
                                    handleCheckout();
                                  }
                                }}
                              >
                                {plan === profile?.plan ? 'Current Plan' : 'Select Plan'}
                              </Button>
                            )}
                            {isCurrentPlan && (
                              <Button 
                                className="w-full" 
                                variant="outline"
                                onClick={handlePortal}
                              >
                                Manage Plan
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  <CreditsDisplay />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Usage History</CardTitle>
                  <CardDescription>
                    Track your credit consumption over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div>
                        <h3 className="text-lg font-medium">Monthly Usage</h3>
                        <p className="text-muted-foreground">Credits used this month</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Report
                      </Button>
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {profile?.plan === 'standard' ? 
                            `${100 - (profile?.credits || 0)}/100 credits used` : 
                            profile?.plan === 'growth' ? 
                            `${500 - (profile?.credits || 0)}/500 credits used` :
                            `${1000 - (profile?.credits || 0)}/1000 credits used`}
                        </span>
                        <span className="text-sm font-medium">
                          {((profile?.plan === 'standard' ? (100 - (profile?.credits || 0)) / 100 : 
                           profile?.plan === 'growth' ? (500 - (profile?.credits || 0)) / 500 : 
                           (1000 - (profile?.credits || 0)) / 1000) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Progress className="h-2" value={(profile?.plan === 'standard' ? (100 - (profile?.credits || 0)) / 100 : 
                                                      profile?.plan === 'growth' ? (500 - (profile?.credits || 0)) / 500 : 
                                                      (1000 - (profile?.credits || 0)) / 1000) * 100} />
                      
                      <div className="mt-6">
                        <h4 className="text-sm font-medium mb-2">Usage Breakdown</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Strategy Creation</span>
                            <span className="text-sm font-medium">42 credits</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Campaign Generation</span>
                            <span className="text-sm font-medium">28 credits</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">AI Analysis</span>
                            <span className="text-sm font-medium">15 credits</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Other Operations</span>
                            <span className="text-sm font-medium">5 credits</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* For testing - Developer section */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="border-t pt-4 mt-8">
                        <h3 className="text-sm font-medium mb-2">Development Testing</h3>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => addCredits.mutate(10)}
                          >
                            Add 10 Credits
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => reportCreditUsage(5)}
                          >
                            Use 5 Credits
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payment-methods">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>
                    Manage your payment methods and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Button onClick={handlePortal} className="mx-auto">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Manage Payment Methods
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      You'll be redirected to Stripe to manage your payment methods securely
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <BillingPreview />
              
              <div className="mt-6 pt-6 border-t">
                <h4 className="font-medium mb-2">Next Payment</h4>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Plan</span>
                  <span>{profile?.plan === 'standard' ? 'Standard' : profile?.plan === 'growth' ? 'Growth' : 'Professional'}</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Amount</span>
                  <span>{profile?.plan === 'standard' ? '$19.99' : profile?.plan === 'growth' ? '$49.99' : '$99.99'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>On the 1st of each month</span>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={handlePortal}
              >
                View Billing History
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about your subscription or billing, our support team is here to help.
              </p>
              <Button variant="outline" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

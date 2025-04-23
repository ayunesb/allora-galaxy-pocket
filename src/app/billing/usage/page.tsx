
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CreditUsageStats } from "@/components/billing/CreditUsageStats";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { Skeleton } from "@/components/ui/skeleton";

export default function UsageDetails() {
  const { profile, isLoading } = useBillingProfile();
  
  // Calculate current billing period
  const getBillingPeriod = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    return {
      startFormatted: startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      endFormatted: endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  };
  
  const billingPeriod = getBillingPeriod();
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Link to="/billing" className="inline-flex items-center text-sm text-muted-foreground mb-2 hover:text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Billing
          </Link>
          <h1 className="text-3xl font-bold">Credits & Usage Details</h1>
          <p className="text-muted-foreground">
            Track your credit usage for the current billing period ({billingPeriod.startFormatted} - {billingPeriod.endFormatted})
          </p>
        </div>
        
        <Link to="/billing/history">
          <Button variant="outline" className="mt-4 md:mt-0">
            View Billing History
          </Button>
        </Link>
      </div>
      
      {/* Credit allocation card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Credit Allocation</CardTitle>
          <CardDescription>
            Your credit balance and allocation for the current billing cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Credits remaining */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Credits Remaining</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">{profile?.credits}</div>
              )}
            </div>
            
            {/* Credits total */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Total Monthly Credits</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold">
                  {profile?.plan === 'standard' 
                    ? '100' 
                    : profile?.plan === 'growth' 
                      ? '500' 
                      : '1000'}
                </div>
              )}
            </div>
            
            {/* Current plan */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Plan</h3>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="flex items-center">
                  <div className="text-3xl font-bold">
                    {profile?.plan 
                      ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) 
                      : 'Standard'
                    }
                  </div>
                  <Link to="/billing">
                    <Button variant="link" className="ml-2 text-sm h-auto p-0">Upgrade</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Credit usage statistics */}
      <CreditUsageStats />
      
      {/* Credit cost explanation */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Credit Usage Guide</CardTitle>
          <CardDescription>
            Understanding how credits are used across different features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Feature Credit Costs</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <span className="font-medium">Create Strategy</span>
                  <span className="text-muted-foreground">5 credits</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <span className="font-medium">Export Data</span>
                  <span className="text-muted-foreground">1 credit</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <span className="font-medium">Recovery Plan</span>
                  <span className="text-muted-foreground">10 credits</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <span className="font-medium">AI Analytics</span>
                  <span className="text-muted-foreground">15 credits</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Credit Policies</h3>
              <ul className="space-y-2 text-sm">
                <li className="p-3 bg-muted rounded-md">
                  <span className="font-medium block mb-1">Monthly Reset</span>
                  <span className="text-muted-foreground">Credits are automatically reset at the start of each billing period</span>
                </li>
                <li className="p-3 bg-muted rounded-md">
                  <span className="font-medium block mb-1">Unused Credits</span>
                  <span className="text-muted-foreground">Credits do not roll over to the next billing cycle</span>
                </li>
                <li className="p-3 bg-muted rounded-md">
                  <span className="font-medium block mb-1">Plan Upgrades</span>
                  <span className="text-muted-foreground">When upgrading your plan, your available credits will be immediately updated</span>
                </li>
                <li className="p-3 bg-muted rounded-md">
                  <span className="font-medium block mb-1">Adding Credits</span>
                  <span className="text-muted-foreground">You can purchase additional credits anytime from the billing dashboard</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Usage alerts */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Usage Alerts</CardTitle>
          <CardDescription>
            Receive notifications about your credit usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="h-5 w-5 rounded-full bg-yellow-500 mr-2"></span>
                  <span className="font-medium">Low Balance Alert (25%)</span>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="h-5 w-5 rounded-full bg-red-500 mr-2"></span>
                  <span className="font-medium">Critical Balance Alert (10%)</span>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="h-5 w-5 rounded-full bg-green-500 mr-2"></span>
                  <span className="font-medium">Credits Reset Notification</span>
                </div>
                <Button variant="outline" size="sm">Enabled</Button>
              </div>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="font-medium mb-2">Notification Settings</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you want to receive usage notifications
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="email-notifications"
                    className="mr-2 h-4 w-4"
                    defaultChecked
                  />
                  <label htmlFor="email-notifications" className="text-sm">Email Notifications</label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="in-app-notifications"
                    className="mr-2 h-4 w-4"
                    defaultChecked
                  />
                  <label htmlFor="in-app-notifications" className="text-sm">In-App Notifications</label>
                </div>
                
                <div className="pt-2">
                  <Button size="sm">Save Preferences</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

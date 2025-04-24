
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { toast } from "sonner";

export function useStripeUsageReporting() {
  const { tenant } = useTenant();
  const [isProcessing, setIsProcessing] = useState(false);

  // Report credit usage to Stripe for metered billing
  const reportCreditUsage = async (creditsUsed: number) => {
    if (!tenant?.id || isProcessing) return false;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase.functions.invoke('report-stripe-usage', {
        body: {
          tenant_id: tenant.id,
          credits_used: creditsUsed,
          timestamp: Math.floor(Date.now() / 1000)
        }
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error reporting usage to Stripe:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Get subscription details from Stripe
  const getSubscriptionDetails = async () => {
    if (!tenant?.id) return null;
    
    try {
      const { data: billingProfile, error: billingError } = await supabase
        .from('billing_profiles')
        .select('stripe_subscription_id')
        .eq('user_id', tenant.id)
        .single();
      
      if (billingError || !billingProfile?.stripe_subscription_id) return null;
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        body: { subscription_id: billingProfile.stripe_subscription_id }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error checking subscription:", error);
      return null;
    }
  };

  // Create a checkout session for subscription or one-time purchase
  const createCheckoutSession = async (plan: 'standard' | 'growth' | 'pro' = 'standard') => {
    if (!tenant?.id) {
      toast.error("No active workspace");
      return null;
    }
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      
      if (error) throw error;
      
      return data?.url;
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  // Open customer portal for subscription management
  const openCustomerPortal = async () => {
    if (!tenant?.id) {
      toast.error("No active workspace");
      return null;
    }
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      return data?.url;
    } catch (error) {
      console.error("Error opening customer portal:", error);
      toast.error("Failed to open customer portal");
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    reportCreditUsage,
    getSubscriptionDetails,
    createCheckoutSession,
    openCustomerPortal,
    isProcessing
  };
}

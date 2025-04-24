
import { useEffect } from "react";
import { useStripeUsageReporting } from "@/hooks/useStripeUsageReporting";
import { useTenant } from "@/hooks/useTenant";
import { useCreditsManager } from "@/hooks/useCreditsManager";

interface BillingUsageTrackerProps {
  creditAmount?: number;
  agentName?: string;
  module?: string;
  enabled?: boolean;
}

/**
 * Component that tracks billing usage and reports to Stripe
 * This is an invisible component that should be mounted where credit usage occurs
 */
export function BillingUsageTracker({
  creditAmount = 1,
  agentName = "System",
  module = "General Usage",
  enabled = true
}: BillingUsageTrackerProps) {
  const { tenant } = useTenant();
  const { useCredits } = useCreditsManager();
  const { reportCreditUsage } = useStripeUsageReporting();
  
  // Track usage on mount if enabled
  useEffect(() => {
    if (!enabled || !tenant?.id) return;
    
    const trackUsage = async () => {
      // First deduct credits from tenant balance
      const deductSuccess = await useCredits(creditAmount, module, agentName);
      
      // If credits were successfully deducted, report usage to Stripe
      if (deductSuccess) {
        await reportCreditUsage(creditAmount);
      }
    };
    
    trackUsage();
  }, [tenant?.id, enabled, creditAmount, agentName, module]);
  
  // This component doesn't render anything
  return null;
}

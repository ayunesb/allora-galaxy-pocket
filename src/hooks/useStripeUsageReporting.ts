
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

export function useStripeUsageReporting() {
  const { tenant } = useTenant();

  const reportCreditUsage = async (creditAmount: number) => {
    if (!tenant?.id) {
      console.error("No tenant ID available for credit usage reporting");
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("report-stripe-usage", {
        body: {
          tenant_id: tenant.id,
          credits_used: creditAmount,
          timestamp: Math.floor(Date.now() / 1000)
        }
      });

      if (error) {
        console.error("Error reporting credit usage to Stripe:", error);
        toast.error("Failed to report credit usage to Stripe");
        return false;
      }

      return true;
    } catch (err) {
      console.error("Exception reporting credit usage to Stripe:", err);
      toast.error("Failed to report credit usage");
      return false;
    }
  };

  return { reportCreditUsage };
}

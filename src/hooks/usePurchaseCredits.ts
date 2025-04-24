
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTenant } from "./useTenant";

export function usePurchaseCredits() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { tenant } = useTenant();
  
  const purchaseCredits = async (amount: number) => {
    if (!tenant?.id || isProcessing) return;
    setIsProcessing(true);
    
    try {
      const { data: { url }, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          type: 'credit_purchase',
          amount 
        }
      });
      
      if (error) throw error;
      if (url) window.location.href = url;
      
    } catch (err) {
      console.error('Error initiating credit purchase:', err);
      toast.error("Failed to initiate credit purchase");
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    purchaseCredits,
    isProcessing
  };
}

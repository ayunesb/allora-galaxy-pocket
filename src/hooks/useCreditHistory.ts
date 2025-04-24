
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export interface CreditUsage {
  id: string;
  feature_name: string;
  credits_used: number;
  description: string;
  created_at: string;
}

export interface CreditPurchase {
  id: string;
  amount: number;
  price_paid: number;
  created_at: string;
  payment_status: string;
}

export function useCreditHistory() {
  const { tenant } = useTenant();
  
  const { data: usageHistory, isLoading: isLoadingUsage } = useQuery({
    queryKey: ['credit-usage', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('credit_usage_details')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as CreditUsage[];
    },
    enabled: !!tenant?.id
  });
  
  const { data: purchaseHistory, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ['credit-purchases', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      
      const { data, error } = await supabase
        .from('credit_purchases')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as CreditPurchase[];
    },
    enabled: !!tenant?.id
  });
  
  return {
    usageHistory,
    purchaseHistory,
    isLoading: isLoadingUsage || isLoadingPurchases
  };
}

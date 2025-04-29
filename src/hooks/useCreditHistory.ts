
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";

export interface CreditHistoryItem {
  id: string;
  amount: number;
  type: string;
  created_at: string;
  user_id: string;
}

export function useCreditHistory() {
  const [history, setHistory] = useState<CreditHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { tenant } = useTenant();

  useEffect(() => {
    const fetchCreditHistory = async () => {
      if (!tenant?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Use credit_usage_log instead of credit_usage_details
        const { data, error: supabaseError } = await supabase
          .from("credit_usage_log")
          .select("*")
          .eq("tenant_id", tenant.id)
          .order("created_at", { ascending: false });

        if (supabaseError) throw supabaseError;

        // Transform the data into our expected format
        const formattedHistory = data?.map(item => ({
          id: item.id,
          amount: item.credits_used,
          type: item.module || 'general',
          created_at: item.created_at,
          user_id: ''  // This field might not be available in credit_usage_log
        })) || [];

        setHistory(formattedHistory);
      } catch (err) {
        console.error("Error fetching credit history:", err);
        setError(err instanceof Error ? err : new Error("Failed to load credit history"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCreditHistory();
  }, [tenant]);

  return { history, isLoading, error };
}

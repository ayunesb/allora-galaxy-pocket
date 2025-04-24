
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import type { LogActivityParams } from "@/types/systemLog";

export function useSystemLogs() {
  const { toast } = useToast();
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const logActivity = async ({ event_type, message, meta = {} }: LogActivityParams) => {
    if (!tenant?.id) {
      console.warn("Cannot log activity: No tenant selected");
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("system_logs").insert({
        tenant_id: tenant.id,
        user_id: user?.id,
        event_type,
        message,
        meta
      });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error("Error logging activity:", err);
      if (process.env.NODE_ENV === "development") {
        toast({
          title: "Error logging activity",
          description: (err as Error).message,
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { logActivity, isLoading };
}

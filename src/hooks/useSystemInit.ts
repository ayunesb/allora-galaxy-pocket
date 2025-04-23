
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useSystemInit() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeSystem = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke("create-system-tables");
      
      if (error) {
        throw error;
      }
      
      setIsInitialized(true);
      console.info("System initialization complete:", data);
    } catch (err) {
      console.error("Error initializing system:", err);
      setError(err.message || "Failed to initialize system");
      toast.error("System initialization failed", {
        description: "Please try again or contact support."
      });
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    initializeSystem();
  }, []);

  return { isInitializing, isInitialized, error, initializeSystem };
}

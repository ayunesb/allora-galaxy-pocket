
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

interface MaintenanceConfig {
  enabled: boolean;
  message: string;
  allowedRoles?: string[];
}

/**
 * Hook to check if the application is in maintenance mode
 * Returns maintenance status and configuration
 */
export function useMaintenanceMode() {
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceConfig>({
    enabled: false,
    message: "Allora OS is currently under maintenance. Please check back shortly.",
  });
  const [tableExists, setTableExists] = useState(true);

  useEffect(() => {
    const fetchMaintenanceStatus = async () => {
      try {
        setIsLoading(true);
        
        // First, check if the table exists by trying to query it
        const { error: tableCheckError } = await supabase
          .from("system_config")
          .select("key")
          .limit(1);
          
        // If there's a PGRST116 error, the table doesn't exist
        if (tableCheckError && tableCheckError.code === "42P01") {
          console.warn("system_config table doesn't exist yet.");
          setTableExists(false);
          setMaintenanceMode({
            enabled: false,
            message: ""
          });
          return;
        }
        
        // If table exists, proceed with fetching maintenance mode config
        const { data, error } = await supabase
          .from("system_config")
          .select("config")
          .eq("key", "maintenance_mode")
          .single();

        if (error) {
          // If no config is found, assume system is operational
          if (error.code === "PGRST116") {
            setMaintenanceMode({
              enabled: false,
              message: ""
            });
          } else {
            console.error("Error fetching maintenance status:", error);
          }
        } else if (data) {
          setMaintenanceMode(data.config as MaintenanceConfig);
        }
      } catch (err) {
        console.error("Unexpected error checking maintenance status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenanceStatus();
  }, []);

  return { isLoading, maintenanceMode, tableExists };
}

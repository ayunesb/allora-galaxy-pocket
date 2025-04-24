
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceMode {
  enabled: boolean;
  message: string;
  allowedRoles: string[];
  startTime: string;
  endTime: string | null;
}

export function useMaintenanceMode() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tableExists, setTableExists] = useState<boolean>(true);
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>({
    enabled: false,
    message: "System is currently undergoing maintenance. Please check back later.",
    allowedRoles: ["admin"],
    startTime: new Date().toISOString(),
    endTime: null
  });
  
  useEffect(() => {
    const checkMaintenanceMode = async () => {
      try {
        const { data, error } = await supabase
          .from("system_config")
          .select("*")
          .eq("key", "maintenance_mode")
          .single();
        
        if (error) {
          if (error.code === "PGRST116") { // Table doesn't exist
            setTableExists(false);
          } else if (error.code === "PGRST104") { // No rows returned
            console.info("No maintenance mode configuration found");
          } else {
            console.error("Error checking maintenance mode:", error);
          }
          setIsLoading(false);
          return;
        }
        
        if (data?.config) {
          setMaintenanceMode({
            enabled: data.config.enabled || false,
            message: data.config.message || maintenanceMode.message,
            allowedRoles: data.config.allowedRoles || ["admin"],
            startTime: data.config.startTime || new Date().toISOString(),
            endTime: data.config.endTime || null
          });
        }
      } catch (err) {
        console.error("Error checking maintenance mode:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkMaintenanceMode();
  }, []);
  
  return { isLoading, maintenanceMode, tableExists };
}

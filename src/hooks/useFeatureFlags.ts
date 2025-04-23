
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useUserRole } from "@/hooks/useUserRole";

export type FeatureFlags = Record<string, boolean>;

interface FeatureFlagsOptions {
  defaultFlags?: FeatureFlags;
}

/**
 * Hook to manage feature flags
 * Loads flags from Supabase and applies role/tenant based rules
 */
export function useFeatureFlags(options: FeatureFlagsOptions = {}) {
  const { defaultFlags = {} } = options;
  const [flags, setFlags] = useState<FeatureFlags>(defaultFlags);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { tenant } = useTenant();
  const { role } = useUserRole();

  useEffect(() => {
    const loadFeatureFlags = async () => {
      try {
        setIsLoading(true);
        
        // Get global feature flags
        const { data: globalFlags, error: globalError } = await supabase
          .from("feature_flags")
          .select("key, enabled, roles_allowed, tenants_allowed")
          .eq("scope", "global");
          
        if (globalError) throw globalError;

        // Get tenant-specific feature flags if tenant exists
        let tenantFlags: any[] = [];
        if (tenant?.id) {
          const { data, error } = await supabase
            .from("feature_flags")
            .select("key, enabled, roles_allowed")
            .eq("scope", "tenant")
            .eq("tenant_id", tenant.id);
            
          if (!error && data) {
            tenantFlags = data;
          }
        }
        
        // Combine and process flags
        const combinedFlags: FeatureFlags = {};
        
        // Process global flags
        if (globalFlags) {
          globalFlags.forEach(flag => {
            // Check role restrictions if they exist
            if (flag.roles_allowed && flag.roles_allowed.length > 0) {
              if (!role || !flag.roles_allowed.includes(role)) {
                combinedFlags[flag.key] = false;
                return;
              }
            }
            
            // Check tenant restrictions if they exist
            if (flag.tenants_allowed && flag.tenants_allowed.length > 0) {
              if (!tenant?.id || !flag.tenants_allowed.includes(tenant.id)) {
                combinedFlags[flag.key] = false;
                return;
              }
            }
            
            combinedFlags[flag.key] = flag.enabled;
          });
        }
        
        // Tenant flags override global flags
        if (tenantFlags.length > 0) {
          tenantFlags.forEach(flag => {
            // Check role restrictions
            if (flag.roles_allowed && flag.roles_allowed.length > 0) {
              if (!role || !flag.roles_allowed.includes(role)) {
                combinedFlags[flag.key] = false;
                return;
              }
            }
            
            combinedFlags[flag.key] = flag.enabled;
          });
        }
        
        setFlags({
          ...defaultFlags,
          ...combinedFlags
        });
      } catch (err) {
        console.error("Error loading feature flags:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeatureFlags();
  }, [user, tenant, role, defaultFlags]);

  /**
   * Check if a feature flag is enabled
   */
  const isEnabled = (flagKey: string): boolean => {
    return flags[flagKey] === true;
  };

  return { 
    flags, 
    isEnabled, 
    isLoading 
  };
}

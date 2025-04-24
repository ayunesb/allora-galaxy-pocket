import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import SystemStatusDetails from "./system-health/SystemStatusDetails";
import TableListSection from "./system-health/TableListSection";
import { RefreshButton } from "./system-health/RefreshButton";
import { SystemOverallStatus } from "./system-health/SystemOverallStatus";
import { CronJobStatus } from "./system-health/CronJobStatus";

interface SystemStatus {
  database: boolean;
  auth: boolean;
  edgeFunctions: boolean;
  maintenance: null | boolean;
  tables: {
    system_config: boolean;
    user_roles: boolean;
    tenant_profiles: boolean;
    company_profiles: boolean;
    persona_profiles: boolean;
  };
}

export default function SystemHealthCheck() {
  const [status, setStatus] = useState<SystemStatus>({
    database: false,
    auth: false,
    edgeFunctions: false,
    maintenance: null,
    tables: {
      system_config: false,
      user_roles: false,
      tenant_profiles: false,
      company_profiles: false,
      persona_profiles: false,
    }
  });
  const [isChecking, setIsChecking] = useState(true);
  const { user } = (() => {
    try {
      return require("@/hooks/useAuth").useAuth();
    } catch {
      return { user: null };
    }
  })();

  const checkSystemHealth = async () => {
    setIsChecking(true);
    const newStatus = { ...status };

    try {
      const { error: dbError } = await supabase.from('tenant_profiles').select('count(*)').limit(1);
      newStatus.database = !dbError;

      newStatus.auth = !!user;

      try {
        const { error: sysConfigError } = await supabase.from('system_config').select('count(*)').limit(1);
        newStatus.tables.system_config = !sysConfigError;

        if (!sysConfigError) {
          const { data: maintenanceData, error: maintenanceError } = await supabase
            .from('system_config')
            .select('config')
            .eq('key', 'maintenance_mode')
            .maybeSingle();

          if (!maintenanceError && maintenanceData) {
            newStatus.maintenance = maintenanceData.config.enabled;
          } else {
            newStatus.maintenance = false;
          }
        }
      } catch (e) {
        console.error("Error checking system_config table:", e);
      }

      try {
        const { error: userRolesError } = await supabase.from('user_roles').select('count(*)').limit(1);
        newStatus.tables.user_roles = !userRolesError;
      } catch (e) {
        console.error("Error checking user_roles table:", e);
      }

      try {
        const { error: tenantError } = await supabase.from('tenant_profiles').select('count(*)').limit(1);
        newStatus.tables.tenant_profiles = !tenantError;
      } catch (e) {
        console.error("Error checking tenant_profiles table:", e);
      }

      try {
        const { error: companyError } = await supabase.from('company_profiles').select('count(*)').limit(1);
        newStatus.tables.company_profiles = !companyError;
      } catch (e) {
        console.error("Error checking company_profiles table:", e);
      }

      try {
        const { error: personaError } = await supabase.from('persona_profiles').select('count(*)').limit(1);
        newStatus.tables.persona_profiles = !personaError;
      } catch (e) {
        console.error("Error checking persona_profiles table:", e);
      }

      try {
        const { error: functionsError } = await supabase.functions.invoke('check-secrets', {
          body: { checkOnly: true }
        });
        newStatus.edgeFunctions = !functionsError;
      } catch (e) {
        console.error("Error checking edge functions:", e);
      }

    } catch (e) {
      console.error("Error checking system health:", e);
      toast.error("Failed to check system health", {
        description: "Please try again or contact support if the issue persists."
      });
    } finally {
      setStatus(newStatus);
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const createSystemConfigTable = async () => {
    try {
      const { error } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS public.system_config (
            key TEXT PRIMARY KEY,
            config JSONB NOT NULL DEFAULT '{}'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
          );
          INSERT INTO public.system_config (key, config)
          VALUES ('maintenance_mode', '{"enabled": false, "message": "Allora OS is currently under maintenance. Please check back shortly."}'::jsonb)
          ON CONFLICT (key) DO NOTHING;
        `
      });

      if (error) throw error;

      toast.success("System configuration table created", {
        description: "The system_config table has been created successfully."
      });
      
      checkSystemHealth();
    } catch (e) {
      console.error("Error creating system_config table:", e);
      toast.error("Failed to create system configuration", {
        description: "Please try again or contact support if the issue persists."
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">System Health Check</CardTitle>
          <RefreshButton isChecking={isChecking} onRefresh={checkSystemHealth} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <SystemStatusDetails
          database={status.database}
          auth={status.auth}
          edgeFunctions={status.edgeFunctions}
          maintenance={status.maintenance}
        />
        <TableListSection tables={status.tables} />
        <CronJobStatus />
      </CardContent>
      <CardFooter className="border-t pt-4 flex-col items-start">
        <p className="text-sm text-muted-foreground mb-2">
          Last checked: {new Date().toLocaleString()}
        </p>
        <SystemOverallStatus status={status} />
      </CardFooter>
    </Card>
  );
}

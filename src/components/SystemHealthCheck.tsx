import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

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
  const { user } = useAuth();

  const checkSystemHealth = async () => {
    setIsChecking(true);
    const newStatus = { ...status };
    
    try {
      // Check database connection
      const { data: dbCheck, error: dbError } = await supabase.from('tenant_profiles').select('count(*)').limit(1);
      newStatus.database = !dbError;

      // Check auth service
      newStatus.auth = !!user;
      
      // Check for maintenance mode table
      try {
        // First check if system_config table exists by querying it
        const { error: sysConfigError } = await supabase.from('system_config').select('count(*)').limit(1);
        newStatus.tables.system_config = !sysConfigError;
        
        if (!sysConfigError) {
          // Get maintenance mode setting if table exists
          const { data: maintenanceData, error: maintenanceError } = await supabase
            .from('system_config')
            .select('config')
            .eq('key', 'maintenance_mode')
            .single();
            
          if (!maintenanceError && maintenanceData) {
            newStatus.maintenance = maintenanceData.config.enabled;
          } else {
            // Table exists but no record found
            newStatus.maintenance = false;
          }
        }
      } catch (err) {
        console.error("Error checking system_config table:", err);
      }

      // Check other critical tables
      try {
        const { error: userRolesError } = await supabase.from('user_roles').select('count(*)').limit(1);
        newStatus.tables.user_roles = !userRolesError;
      } catch (err) {
        console.error("Error checking user_roles table:", err);
      }

      try {
        const { error: tenantError } = await supabase.from('tenant_profiles').select('count(*)').limit(1);
        newStatus.tables.tenant_profiles = !tenantError;
      } catch (err) {
        console.error("Error checking tenant_profiles table:", err);
      }

      try {
        const { error: companyError } = await supabase.from('company_profiles').select('count(*)').limit(1);
        newStatus.tables.company_profiles = !companyError;
      } catch (err) {
        console.error("Error checking company_profiles table:", err);
      }

      try {
        const { error: personaError } = await supabase.from('persona_profiles').select('count(*)').limit(1);
        newStatus.tables.persona_profiles = !personaError;
      } catch (err) {
        console.error("Error checking persona_profiles table:", err);
      }

      // Check edge functions by calling the check-secrets function
      try {
        const { error: functionsError } = await supabase.functions.invoke('check-secrets', {
          body: { checkOnly: true }
        });
        newStatus.edgeFunctions = !functionsError;
      } catch (err) {
        console.error("Error checking edge functions:", err);
      }

    } catch (err) {
      console.error("Error checking system health:", err);
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
      // Create the system_config table if it doesn't exist
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
      
      // Re-check system health
      checkSystemHealth();
    } catch (err) {
      console.error("Error creating system_config table:", err);
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
          <Button 
            size="sm" 
            variant="outline" 
            onClick={checkSystemHealth} 
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span>Database Connection</span>
            {status.database ? (
              <Badge variant="success" className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" /> Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-4 w-4 mr-1" /> Failed
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Authentication</span>
            {status.auth ? (
              <Badge variant="success" className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" /> Active
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-4 w-4 mr-1" /> Not Authenticated
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Edge Functions</span>
            {status.edgeFunctions ? (
              <Badge variant="success" className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" /> Available
              </Badge>
            ) : (
              <Badge variant="destructive">
                <AlertCircle className="h-4 w-4 mr-1" /> Unavailable
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span>Maintenance Mode</span>
            {status.maintenance === null ? (
              <Badge variant="outline">
                <AlertCircle className="h-4 w-4 mr-1" /> Unknown
              </Badge>
            ) : status.maintenance ? (
              <Badge variant="warning" className="bg-yellow-500 text-black">
                <AlertCircle className="h-4 w-4 mr-1" /> Enabled
              </Badge>
            ) : (
              <Badge variant="success" className="bg-green-500">
                <CheckCircle className="h-4 w-4 mr-1" /> Disabled
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium mb-3">Required Tables</h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(status.tables).map(([table, exists]) => (
              <div key={table} className="flex items-center justify-between">
                <span className="text-sm">{table}</span>
                {exists ? (
                  <Badge variant="success" className="bg-green-500 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" /> Exists
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" /> Missing
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {!status.tables.system_config && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>System configuration table missing</AlertTitle>
            <AlertDescription>
              The system_config table required for maintenance mode is missing.
              <Button 
                onClick={createSystemConfigTable} 
                variant="outline" 
                size="sm" 
                className="mt-2"
              >
                Create Table
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 flex-col items-start">
        <p className="text-sm text-muted-foreground mb-2">
          Last checked: {new Date().toLocaleString()}
        </p>
        {Object.values(status).some(value => 
          value === false || 
          (typeof value === 'object' && Object.values(value).some(v => v === false))
        ) ? (
          <div className="w-full">
            <Alert variant="destructive">
              <AlertTitle>System issues detected</AlertTitle>
              <AlertDescription>
                Some components may not function correctly. Please fix the issues above before proceeding.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="w-full">
            <Alert variant="default" className="bg-green-50 border-green-200">
              <AlertTitle>All systems operational</AlertTitle>
              <AlertDescription>
                Your Allora OS environment is properly configured and ready for use.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

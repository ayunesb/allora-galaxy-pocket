
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";

export interface SecurityAuditResult {
  tableName: string;
  hasRls: boolean;
  hasTenantId: boolean;
  hasAuthPolicies: boolean;
  securityScore: number;
  recommendations: string[];
  policies: {
    name: string;
    using: string;
    command: string;
    hasAuthReference: boolean;
  }[];
}

export function useSecurityAudit() {
  const [results, setResults] = useState<SecurityAuditResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { user } = useAuth();
  const { tenant } = useTenant();
  
  // Get list of all tables in the public schema
  const { data: tables, isLoading: tablesLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (error) {
        throw error;
      }
      
      return data.map(row => row.tablename) as string[];
    },
    enabled: !!user
  });
  
  const runSecurityAudit = useCallback(async () => {
    if (!tables?.length || !user || !tenant) {
      toast.error("Cannot run security audit", { 
        description: "Missing tables list, authentication, or tenant context" 
      });
      return;
    }
    
    setIsScanning(true);
    try {
      const securityResults: SecurityAuditResult[] = [];
      
      // Check edge function for security audit
      const { data: securityAuditData, error: securityAuditError } = await supabase.functions
        .invoke("security_audit");
        
      if (securityAuditError) {
        throw securityAuditError;
      }
      
      // Process security audit data
      if (securityAuditData) {
        const { tablesWithoutRLS, incompleteRLSPolicies } = securityAuditData;
        
        // Process tables with missing RLS
        for (const table of tablesWithoutRLS || []) {
          securityResults.push({
            tableName: table.table_name,
            hasRls: false,
            hasTenantId: !!table.has_tenant_id,
            hasAuthPolicies: false,
            securityScore: 10, // Very low score for tables without RLS
            recommendations: [
              "Enable Row Level Security",
              "Add policies that reference auth.uid()",
              ...(table.has_tenant_id ? [] : ["Consider adding tenant_id column"])
            ],
            policies: []
          });
        }
      }
      
      // For tables not already processed, check their RLS status
      const tablesToCheck = tables.filter(tableName => 
        !securityResults.find(r => r.tableName === tableName)
      );
      
      for (const tableName of tablesToCheck) {
        const { data, error } = await supabase.rpc('check_table_tenant_rls_status', {
          table_name: tableName
        });
        
        if (error) {
          console.error(`Error checking RLS for ${tableName}:`, error);
          continue;
        }
        
        if (data && data.length > 0) {
          const { has_rls, has_tenant_id, has_auth_policy, policies } = data[0];
          
          const parsedPolicies = policies ? JSON.parse(policies) : [];
          
          // Calculate security score
          let securityScore = 0;
          if (has_rls) securityScore += 40;
          if (has_tenant_id) securityScore += 20;
          if (has_auth_policy) securityScore += 40;
          
          // Generate recommendations
          const recommendations = [];
          if (!has_rls) recommendations.push("Enable Row Level Security");
          if (!has_tenant_id) recommendations.push("Consider adding tenant_id column");
          if (!has_auth_policy) recommendations.push("Add policies that reference auth.uid()");
          
          securityResults.push({
            tableName,
            hasRls: has_rls,
            hasTenantId: has_tenant_id,
            hasAuthPolicies: has_auth_policy,
            securityScore,
            recommendations,
            policies: parsedPolicies
          });
        }
      }
      
      setResults(securityResults);
      
      // Show summary
      const tablesWithIssues = securityResults.filter(r => r.securityScore < 100).length;
      if (tablesWithIssues > 0) {
        toast.warning(`Found security issues in ${tablesWithIssues} tables`, {
          description: "Check the security audit report for details"
        });
      } else {
        toast.success("Security audit completed", {
          description: "No major security issues found"
        });
      }
    } catch (error) {
      console.error("Error running security audit:", error);
      toast.error("Failed to run security audit", {
        description: error.message
      });
    } finally {
      setIsScanning(false);
    }
  }, [tables, user, tenant]);
  
  return {
    runSecurityAudit,
    results,
    isScanning,
    tablesLoading
  };
}

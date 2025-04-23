
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export interface SecurityAuditIssue {
  type: 'security_definer_view' | 'rls_disabled' | 'incomplete_rls';
  name: string;
  schema: string;
  detail: string;
  remediation: string;
}

export function useSecurityAudit() {
  const [issues, setIssues] = useState<SecurityAuditIssue[]>([]);
  
  const { isLoading, error, refetch } = useQuery({
    queryKey: ['security-audit'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("security_audit");
        
        if (error) throw error;
        
        // Transform the data into a standardized format
        const auditIssues: SecurityAuditIssue[] = [];
        
        // Process security definer views
        data.securityDefinerViews?.forEach(view => {
          auditIssues.push({
            type: 'security_definer_view',
            name: view.viewname,
            schema: view.schemaname,
            detail: `View is defined with SECURITY DEFINER property`,
            remediation: 'Recreate the view without SECURITY DEFINER'
          });
        });
        
        // Process tables without RLS
        data.tablesWithoutRLS?.forEach(table => {
          auditIssues.push({
            type: 'rls_disabled',
            name: table.table_name,
            schema: 'public',
            detail: 'Row Level Security is not enabled on this table',
            remediation: `Run ALTER TABLE public.${table.table_name} ENABLE ROW LEVEL SECURITY;`
          });
        });
        
        // Process incomplete RLS policies
        data.incompleteRLSPolicies?.forEach(policy => {
          auditIssues.push({
            type: 'incomplete_rls',
            name: `${policy.tablename}.${policy.policyname}`,
            schema: 'public',
            detail: 'RLS policy missing proper auth.uid() reference',
            remediation: 'Update policy to include auth.uid() checks'
          });
        });
        
        setIssues(auditIssues);
        return data;
      } catch (err) {
        console.error("Error fetching security audit:", err);
        toast.error("Failed to perform security audit", {
          description: err.message
        });
        throw err;
      }
    },
    enabled: false // Don't run on component mount, we'll trigger it manually
  });

  return {
    runSecurityAudit: refetch,
    isLoading,
    error,
    issues
  };
}

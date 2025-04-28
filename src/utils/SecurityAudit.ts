
import { supabase } from "@/integrations/supabase/client";

export interface SecurityAuditResult {
  table: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

export async function checkTableSecurity(): Promise<SecurityAuditResult[]> {
  const issues: SecurityAuditResult[] = [];
  
  try {
    // Check for tables without RLS enabled
    const { data: tables, error } = await supabase.rpc('audit_rls_configuration');
    
    if (error) {
      console.error('Error checking RLS configuration:', error);
      return [{
        table: 'unknown',
        issue: 'Failed to check RLS configuration',
        severity: 'high',
        recommendation: 'Check Supabase logs for errors'
      }];
    }
    
    // Process results and create issue list
    (tables || []).forEach(table => {
      if (!table.rls_enabled) {
        issues.push({
          table: table.table_name,
          issue: 'Row Level Security is not enabled',
          severity: 'high',
          recommendation: `Enable RLS with: ALTER TABLE ${table.table_name} ENABLE ROW LEVEL SECURITY;`
        });
      }
      
      if (table.rls_enabled && !table.has_tenant_id) {
        issues.push({
          table: table.table_name,
          issue: 'Table is missing tenant_id column for multi-tenancy',
          severity: 'medium',
          recommendation: `Consider adding tenant_id column for proper multi-tenant isolation`
        });
      }
      
      if (table.rls_enabled && !table.has_auth_policy) {
        issues.push({
          table: table.table_name,
          issue: 'No policies using auth.uid() for authentication',
          severity: 'medium',
          recommendation: `Review policies for ${table.table_name} to ensure proper authorization`
        });
      }
    });
    
    return issues;
  } catch (error) {
    console.error('Error running security audit:', error);
    return [{
      table: 'unknown',
      issue: 'Security audit failed with an exception',
      severity: 'high',
      recommendation: 'Check browser console for error details'
    }];
  }
}

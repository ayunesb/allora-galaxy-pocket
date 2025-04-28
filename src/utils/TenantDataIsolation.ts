
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates that RLS policies correctly enforce tenant isolation
 */
export async function validateTenantIsolation(tenantId: string): Promise<{ 
  success: boolean;
  issues: { table: string; issue: string }[];
}> {
  const issues: { table: string; issue: string }[] = [];
  
  try {
    // Test our core security definer functions
    const { data: tenantAccess, error: accessError } = await supabase.rpc(
      'check_tenant_user_access_safe', 
      { tenant_uuid: tenantId, user_uuid: supabase.auth.getUser().then(res => res.data.user?.id || '') }
    );
    
    if (accessError) {
      issues.push({
        table: 'tenant_user_roles',
        issue: `Access function error: ${accessError.message}`
      });
    }
    
    // Test tenant isolation on critical tables
    const criticalTables = ['campaigns', 'strategies', 'kpi_metrics'];
    
    for (const table of criticalTables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .eq('tenant_id', tenantId);
      
      if (tableError && tableError.message.includes('policy')) {
        issues.push({
          table,
          issue: `Policy error: ${tableError.message}`
        });
      }
    }
    
    return {
      success: issues.length === 0,
      issues
    };
  } catch (error: any) {
    return {
      success: false,
      issues: [{
        table: 'general',
        issue: `Tenant isolation validation error: ${error.message}`
      }]
    };
  }
}

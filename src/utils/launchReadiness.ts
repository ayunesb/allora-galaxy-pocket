
import { supabase } from '@/integrations/supabase/client';

/**
 * Types of checks to perform
 */
export type CheckType = 'auth' | 'database' | 'rls' | 'tenant' | 'roles';

/**
 * Result of a system check
 */
export interface CheckResult {
  type: CheckType;
  passed: boolean;
  message: string;
  details?: string;
  timestamp: Date;
}

/**
 * Perform authentication check
 */
export async function checkAuthentication(): Promise<CheckResult> {
  try {
    const { data: session, error } = await supabase.auth.getSession();
    
    return {
      type: 'auth',
      passed: !error && !!session,
      message: error ? 'Authentication error' : 'Authentication working properly',
      details: error ? error.message : undefined,
      timestamp: new Date()
    };
  } catch (err) {
    return {
      type: 'auth',
      passed: false,
      message: 'Error checking authentication',
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date()
    };
  }
}

/**
 * Perform database connection check
 */
export async function checkDatabaseConnection(): Promise<CheckResult> {
  try {
    const { data, error } = await supabase
      .from('system_logs')
      .select('count')
      .limit(1);
    
    return {
      type: 'database',
      passed: !error,
      message: error ? 'Database connection error' : 'Database connection successful',
      details: error ? error.message : undefined,
      timestamp: new Date()
    };
  } catch (err) {
    return {
      type: 'database',
      passed: false,
      message: 'Error checking database connection',
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date()
    };
  }
}

/**
 * Check for RLS policy recursion issues
 */
export async function checkRlsPolicies(): Promise<CheckResult> {
  try {
    const { data, error } = await supabase.rpc(
      "check_tenant_user_access", 
      { tenant_uuid: '00000000-0000-0000-0000-000000000000', user_uuid: '00000000-0000-0000-0000-000000000000' }
    );
    
    const hasRecursionError = error?.message?.includes('recursion');
    
    return {
      type: 'rls',
      passed: !hasRecursionError,
      message: hasRecursionError 
        ? 'Recursive RLS policy detected' 
        : 'RLS policies configured correctly',
      details: error ? error.message : undefined,
      timestamp: new Date()
    };
  } catch (err) {
    return {
      type: 'rls',
      passed: false,
      message: 'Error checking RLS policies',
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date()
    };
  }
}

/**
 * Check tenant data access
 */
export async function checkTenantAccess(): Promise<CheckResult> {
  try {
    const { data, error } = await supabase
      .from('tenant_profiles')
      .select('count')
      .limit(1);
    
    return {
      type: 'tenant',
      passed: !error,
      message: error ? 'Tenant access error' : 'Tenant access configured correctly',
      details: error ? error.message : undefined,
      timestamp: new Date()
    };
  } catch (err) {
    return {
      type: 'tenant',
      passed: false,
      message: 'Error checking tenant access',
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date()
    };
  }
}

/**
 * Check user roles
 */
export async function checkUserRoles(): Promise<CheckResult> {
  try {
    const { data, error } = await supabase
      .from('tenant_user_roles')
      .select('count')
      .limit(1);
    
    return {
      type: 'roles',
      passed: !error,
      message: error ? 'User roles error' : 'User roles configured correctly',
      details: error ? error.message : undefined,
      timestamp: new Date()
    };
  } catch (err) {
    return {
      type: 'roles',
      passed: false,
      message: 'Error checking user roles',
      details: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date()
    };
  }
}

/**
 * Run all system checks
 */
export async function runAllChecks(): Promise<Record<CheckType, CheckResult>> {
  const auth = await checkAuthentication();
  const database = await checkDatabaseConnection();
  const rls = await checkRlsPolicies();
  const tenant = await checkTenantAccess();
  const roles = await checkUserRoles();
  
  return {
    auth,
    database,
    rls,
    tenant,
    roles
  };
}

/**
 * Calculate overall system health score (0-100)
 */
export function calculateHealthScore(results: Record<CheckType, CheckResult>): number {
  const checks = Object.values(results);
  if (checks.length === 0) return 0;
  
  const passedCount = checks.filter(check => check.passed).length;
  return Math.round((passedCount / checks.length) * 100);
}

/**
 * Get system readiness status based on health score
 */
export function getReadinessStatus(score: number): 'critical' | 'warning' | 'ready' {
  if (score < 70) return 'critical';
  if (score < 90) return 'warning';
  return 'ready';
}

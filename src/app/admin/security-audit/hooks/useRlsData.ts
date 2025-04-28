
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RlsPolicy {
  tableName: string;
  hasRls: boolean;
  hasTenantId: boolean;
  hasAuthPolicy: boolean;
  securityLevel: string;
  // Add properties that the components need
  policies?: {
    policyname: string;
    command: string;
    definition: string;
  }[];
  // These were used in the old interface
  rlsEnabled?: boolean;
  tablename?: string;
}

export function useRlsData() {
  const [tables, setTables] = useState<RlsPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRlsTables = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the built-in check_table_security_status function
      const { data, error } = await supabase.rpc('check_table_security_status');
      
      if (error) throw error;
      
      if (data) {
        // Convert to our RlsPolicy format
        const formattedData: RlsPolicy[] = data.map((item: any) => ({
          tableName: item.table_name,
          tablename: item.table_name, // For backward compatibility
          hasRls: item.rls_enabled,
          rlsEnabled: item.rls_enabled, // For backward compatibility
          hasTenantId: item.has_tenant_id,
          hasAuthPolicy: item.has_auth_policy,
          securityLevel: getSecurityLevel(item.rls_enabled, item.has_tenant_id, item.has_auth_policy)
        }));
        
        setTables(formattedData);
      }

      // Get policies for each table
      const { data: policies } = await supabase.from('pg_policies').select('*');
      
      if (policies) {
        // Map policies to tables
        const tablesWithPolicies = tables.map(table => {
          const tablePolicies = policies.filter(policy => policy.tablename === table.tableName);
          return {
            ...table,
            policies: tablePolicies
          };
        });
        
        setTables(tablesWithPolicies);
      }
    } catch (err) {
      console.error('Error fetching RLS data:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching RLS data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRlsTables();
  }, []);

  // Helper function to determine security level
  const getSecurityLevel = (hasRls: boolean, hasTenantId: boolean, hasAuthPolicy: boolean): string => {
    if (!hasRls) return 'critical';
    if (!hasTenantId) return 'warning';
    if (!hasAuthPolicy) return 'warning';
    return 'secure';
  };

  return { tables, loading, error, fetchRlsTables };
}

// Add needed types for backwards compatibility
export type RlsTable = RlsPolicy;

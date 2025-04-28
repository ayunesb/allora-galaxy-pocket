import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RlsPolicy {
  tableName: string;
  hasRls: boolean;
  hasTenantId: boolean;
  hasAuthPolicy: boolean;
  securityLevel: string;
}

export function useRlsData() {
  const [tables, setTables] = useState<RlsPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRlsData = async () => {
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
            hasRls: item.rls_enabled,
            hasTenantId: item.has_tenant_id,
            hasAuthPolicy: item.has_auth_policy,
            securityLevel: getSecurityLevel(item.rls_enabled, item.has_tenant_id, item.has_auth_policy)
          }));
          
          setTables(formattedData);
        }
      } catch (err) {
        console.error('Error fetching RLS data:', err);
        setError(err instanceof Error ? err : new Error('Unknown error fetching RLS data'));
      } finally {
        setLoading(false);
      }
    };

    fetchRlsData();
  }, []);

  // Helper function to determine security level
  const getSecurityLevel = (hasRls: boolean, hasTenantId: boolean, hasAuthPolicy: boolean): string => {
    if (!hasRls) return 'critical';
    if (!hasTenantId) return 'warning';
    if (!hasAuthPolicy) return 'warning';
    return 'secure';
  };

  return { tables, loading, error };
}

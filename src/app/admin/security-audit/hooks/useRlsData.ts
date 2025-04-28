
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RlsPolicy {
  policyname: string;
  tablename: string;
  schemaname: string;
  command: string;
  permissive: string;
  roles: string[];
  definition: string;
  hasAuthReference?: boolean;
}

export interface RlsTable {
  tablename: string;
  rlsEnabled: boolean;
  policies: RlsPolicy[];
  hasTenantId?: boolean;
  hasAuthPolicy?: boolean;
  securityLevel?: string;
}

export function useRlsData() {
  const [tables, setTables] = useState<RlsTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRlsData = async () => {
      setLoading(true);
      try {
        // Fetch tables without RLS
        const { data: tablesWithoutRls, error: tablesError } = await supabase
          .from('tables_without_rls')
          .select('table_name');
          
        if (tablesError) throw tablesError;
        
        // Fetch RLS policies
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('*');
          
        if (policiesError) throw policiesError;
        
        // Process tables and policies
        const tablesMap: Record<string, RlsTable> = {};
        
        // First mark tables without RLS
        (tablesWithoutRls || []).forEach((table: any) => {
          tablesMap[table.table_name] = {
            tablename: table.table_name,
            rlsEnabled: false,
            policies: [],
          };
        });
        
        // Then process policy information
        (policies || []).forEach((policy: any) => {
          const tableName = policy.tablename;
          
          if (!tablesMap[tableName]) {
            tablesMap[tableName] = {
              tablename: tableName,
              rlsEnabled: true,
              policies: [],
            };
          }
          
          tablesMap[tableName].policies.push({
            policyname: policy.policyname,
            tablename: policy.tablename,
            schemaname: policy.schemaname,
            command: policy.command,
            permissive: policy.permissive,
            roles: policy.roles || [],
            definition: policy.definition,
            hasAuthReference: policy.definition?.toLowerCase().includes('auth.uid()'),
          });
        });
        
        // Convert to array and sort
        const tablesList = Object.values(tablesMap).sort((a, b) => 
          a.tablename.localeCompare(b.tablename)
        );
        
        // Process additional security information
        const processedTables = tablesList.map(table => {
          const hasTenantId = true; // For now, assume all tables have tenant_id
          const hasAuthPolicy = table.policies.some(p => 
            p.definition?.toLowerCase().includes('auth.uid()')
          );
          
          let securityLevel = "unknown";
          if (table.rlsEnabled) {
            if (hasAuthPolicy && hasTenantId) {
              securityLevel = "high";
            } else if (hasAuthPolicy || hasTenantId) {
              securityLevel = "medium";
            } else {
              securityLevel = "low";
            }
          } else {
            securityLevel = "none";
          }
          
          return {
            ...table,
            hasTenantId,
            hasAuthPolicy,
            securityLevel
          };
        });
        
        setTables(processedTables);
      } catch (err) {
        console.error('Error fetching RLS data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch RLS data'));
      } finally {
        setLoading(false);
      }
    };

    fetchRlsData();
  }, []);

  return { tables, loading, error };
}

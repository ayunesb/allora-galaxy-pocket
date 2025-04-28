
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "@/components/ui/sonner";

export interface RlsPolicy {
  policyname: string;
  tablename: string;
  command: string;
  definition: string;
  permissive: string;
  roles: string[];
}

export interface RlsTable {
  tablename: string;
  rlsEnabled: boolean;
  policies: RlsPolicy[];
}

export function useRlsData() {
  const [tables, setTables] = useState<RlsTable[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRlsTables = async () => {
    setIsLoading(true);
    try {
      // Use direct SQL query for schema tables since they're not in the type system
      const { data: allTables, error: tablesError } = await supabase.rpc('list_tables_with_rls_status');

      if (tablesError) throw tablesError;
      
      const tableResults: RlsTable[] = [];
      
      for (const table of allTables) {
        if (!table.table_name) continue;
        
        const { data: rlsCheck, error: rlsError } = await supabase.rpc('check_table_tenant_rls_status', { 
          table_name: table.table_name 
        });
        
        if (rlsError) {
          console.error(`Error checking RLS status for ${table.table_name}:`, rlsError);
          continue;
        }
        
        const isRlsEnabled = rlsCheck?.[0]?.has_rls || false;
        
        let policies: RlsPolicy[] = [];
        if (isRlsEnabled) {
          // Get policies for this table via RPC call
          const { data: policyData, error: policyError } = await supabase.rpc('get_table_policies', {
            table_name: table.table_name
          });
            
          if (policyError) {
            console.error(`Error fetching policies for ${table.table_name}:`, policyError);
          } else if (policyData) {
            policies = policyData;
          }
        }
        
        tableResults.push({
          tablename: table.table_name,
          rlsEnabled: isRlsEnabled,
          policies: policies
        });
      }
      
      setTables(tableResults);
    } catch (error) {
      console.error("Error fetching RLS tables:", error);
      toast.error("Failed to fetch RLS information", {
        description: "Check console for details"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRlsTables();
  }, []);

  return {
    tables,
    isLoading,
    fetchRlsTables
  };
}

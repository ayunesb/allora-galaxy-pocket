
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
      const { data: allTables, error: tablesError } = await supabase
        .from("pg_tables")
        .select("tablename")
        .eq("schemaname", "public");

      if (tablesError) throw tablesError;
      
      const tableResults: RlsTable[] = [];
      
      for (const table of allTables) {
        const { data: rlsCheck, error: rlsError } = await supabase
          .rpc("check_table_rls_status", { table_name: table.tablename });
        
        if (rlsError) {
          console.error(`Error checking RLS status for ${table.tablename}:`, rlsError);
          continue;
        }
        
        const isRlsEnabled = rlsCheck?.[0]?.rls_enabled || false;
        
        let policies: RlsPolicy[] = [];
        if (isRlsEnabled) {
          const { data: policyData, error: policyError } = await supabase
            .from("pg_policies")
            .select("*")
            .eq("tablename", table.tablename)
            .eq("schemaname", "public");
            
          if (policyError) {
            console.error(`Error fetching policies for ${table.tablename}:`, policyError);
          } else {
            policies = policyData;
          }
        }
        
        tableResults.push({
          tablename: table.tablename,
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

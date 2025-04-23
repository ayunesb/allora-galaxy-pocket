
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "@/components/ui/sonner";
import type { RlsTable } from "./useRlsData";

export interface AccessTestResult {
  tableName: string;
  status: "allowed" | "blocked" | "error" | "untested";
  errorMessage?: string;
  rowCount?: number;
}

export function useAccessTests() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [testResults, setTestResults] = useState<AccessTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const runAccessTests = async (tables: RlsTable[]) => {
    if (!user || !tenant) {
      toast.warning("Authentication required", {
        description: "You must be logged in with an active tenant to run access tests"
      });
      return;
    }
    
    setIsRunningTests(true);
    const results: AccessTestResult[] = [];
    
    try {
      for (const table of tables) {
        if (!table.rlsEnabled) continue;
        
        try {
          const { data, error, count } = await supabase
            .from(table.tablename)
            .select("*", { count: "exact" })
            .limit(1);
          
          if (error) {
            results.push({
              tableName: table.tablename,
              status: "error",
              errorMessage: error.message,
            });
          } else {
            results.push({
              tableName: table.tablename,
              status: "allowed",
              rowCount: count || 0
            });
          }
        } catch (e: any) {
          results.push({
            tableName: table.tablename,
            status: "blocked",
            errorMessage: e.message
          });
        }
      }
      
      setTestResults(results);
      setLastRun(new Date().toLocaleString());
      toast.success("Access tests completed", {
        description: `Tested ${results.length} tables with RLS enabled`
      });
    } catch (error) {
      console.error("Error running access tests:", error);
      toast.error("Failed to complete access tests", {
        description: "Check console for details"
      });
    } finally {
      setIsRunningTests(false);
    }
  };

  return {
    testResults,
    isRunningTests,
    lastRun,
    runAccessTests
  };
}

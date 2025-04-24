
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import type { RlsTable } from "./useRlsData";

export interface AccessTestResult {
  tableName: string;
  status: 'allowed' | 'blocked' | 'error';
  rowCount?: number;
  errorMessage?: string;
}

export function useAccessTests() {
  const [testResults, setTestResults] = useState<AccessTestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [lastRun, setLastRun] = useState<string>('');

  const runAccessTests = async (tables: RlsTable[]) => {
    setIsRunningTests(true);
    const results: AccessTestResult[] = [];

    try {
      for (const table of tables) {
        try {
          // Attempt to select data from the table
          const { data, error, count } = await supabase
            .from(table.tablename)
            .select('*', { count: 'exact' })
            .limit(5);

          if (error) {
            // Policy blocked access
            results.push({
              tableName: table.tablename,
              status: 'blocked',
              errorMessage: error.message
            });
          } else {
            // Access allowed
            results.push({
              tableName: table.tablename,
              status: 'allowed',
              rowCount: count || 0
            });
          }
        } catch (err) {
          // Unexpected error
          results.push({
            tableName: table.tablename,
            status: 'error',
            errorMessage: (err as Error).message
          });
        }
      }

      setTestResults(results);
      setLastRun(new Date().toLocaleString());
      
      // Show result summary
      const allowedCount = results.filter(r => r.status === 'allowed').length;
      const blockedCount = results.filter(r => r.status === 'blocked').length;
      
      toast.success("Access tests completed", {
        description: `${allowedCount} tables accessible, ${blockedCount} tables blocked`
      });
      
    } catch (error) {
      console.error("Error running access tests:", error);
      toast.error("Failed to run access tests");
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

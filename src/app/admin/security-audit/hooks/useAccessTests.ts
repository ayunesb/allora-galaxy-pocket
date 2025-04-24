
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
  const [lastRun, setLastRun] = useState<string>("");

  const runAccessTests = async (tables: RlsTable[]) => {
    setIsRunningTests(true);
    const results: AccessTestResult[] = [];

    try {
      for (const table of tables) {
        try {
          // Try to select from the table
          const { data, error, count } = await supabase
            .from(table.tablename)
            .select('*', { count: 'exact' })
            .limit(1);

          if (error) {
            // Access denied
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
        } catch (e: any) {
          // Unexpected error
          results.push({
            tableName: table.tablename,
            status: 'error',
            errorMessage: e.message
          });
        }
      }

      setTestResults(results);
      setLastRun(new Date().toLocaleString());
      
      // Log security audit run
      try {
        await supabase.from('system_logs').insert({
          event_type: 'SECURITY_AUDIT',
          message: 'Security access tests executed',
          meta: {
            total_tests: results.length,
            allowed: results.filter(r => r.status === 'allowed').length,
            blocked: results.filter(r => r.status === 'blocked').length,
            errors: results.filter(r => r.status === 'error').length
          }
        });
      } catch (err) {
        console.error("Error logging security audit:", err);
      }
      
      toast.success("Access tests completed", {
        description: `Tested ${results.length} tables`
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

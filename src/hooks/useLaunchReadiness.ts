
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LaunchReadinessResult {
  healthScore: number;
  status: "error" | "complete" | "idle" | "running";
  results: any;
  isRunning: boolean;
  isComplete: boolean;
  isError: boolean;
  runChecks: () => Promise<void>;
}

export function useLaunchReadiness(autoRun = false): LaunchReadinessResult {
  const [healthScore, setHealthScore] = useState(0);
  const [status, setStatus] = useState<"error" | "complete" | "idle" | "running">("idle");
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isError, setIsError] = useState(false);

  const runChecks = useCallback(async () => {
    if (isRunning) return;
    
    try {
      setIsRunning(true);
      setStatus("running");
      setIsComplete(false);
      setIsError(false);
      
      // Simulate a check process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Make a real API call to check system status
      const { data, error } = await supabase
        .from('system_health')
        .select('*')
        .limit(1);
        
      if (error) {
        throw error;
      }
      
      // Calculate scores based on simulation
      const securityScore = 96;
      const performanceScore = 88;
      const functionalityScore = 94;
      const testsPassed = 14;
      const totalTests = 15;
      
      // Compute overall score
      const overallScore = Math.round((securityScore + performanceScore + functionalityScore) / 3);
      
      setHealthScore(overallScore);
      setResults({
        securityScore,
        performanceScore,
        functionalityScore,
        testsPassed,
        totalTests
      });
      setStatus("complete");
      setIsComplete(true);
    } catch (error) {
      console.error('Error in launch readiness check:', error);
      setStatus("error");
      setIsError(true);
      setHealthScore(0);
      setResults(null);
    } finally {
      setIsRunning(false);
    }
  }, [isRunning]);

  useEffect(() => {
    if (autoRun && status === "idle") {
      runChecks();
    }
  }, [autoRun, status, runChecks]);

  return {
    healthScore,
    status,
    results,
    isRunning,
    isComplete,
    isError,
    runChecks
  };
}

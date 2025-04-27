
import { useState, useEffect } from 'react';
import {
  CheckType, 
  CheckResult, 
  runAllChecks, 
  calculateHealthScore,
  getReadinessStatus
} from '@/utils/launchReadiness';

interface LaunchReadinessState {
  results: Partial<Record<CheckType, CheckResult>>;
  healthScore: number;
  status: 'critical' | 'warning' | 'ready' | 'checking';
  isChecking: boolean;
  lastChecked: Date | null;
  error: string | null;
}

export function useLaunchReadiness(autoCheck: boolean = true) {
  const [state, setState] = useState<LaunchReadinessState>({
    results: {},
    healthScore: 0,
    status: 'checking',
    isChecking: false,
    lastChecked: null,
    error: null
  });

  const runChecks = async () => {
    if (state.isChecking) return;
    
    try {
      setState(prev => ({ ...prev, isChecking: true, status: 'checking' }));
      
      const results = await runAllChecks();
      const healthScore = calculateHealthScore(results);
      const status = getReadinessStatus(healthScore);
      
      setState({
        results,
        healthScore,
        status,
        isChecking: false,
        lastChecked: new Date(),
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isChecking: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during checks'
      }));
    }
  };

  useEffect(() => {
    if (autoCheck) {
      runChecks();
    }
  }, [autoCheck]);

  return {
    ...state,
    runChecks
  };
}

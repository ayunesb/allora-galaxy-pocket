
import { useState, useEffect } from 'react';
import { useLaunchReadiness } from './useLaunchReadiness';

export interface SystemVerificationResult {
  healthScore: number;
  status: 'idle' | 'running' | 'complete' | 'error';
  results: {
    securityScore: number;
    performanceScore: number;
    functionalityScore: number;
    testsRun: number;
    testsPassed: number;
  } | null;
  isRunning: boolean;
  isComplete: boolean;
  isError: boolean;
}

export function useSystemVerification(autoRun = false): SystemVerificationResult {
  const launchReadiness = useLaunchReadiness(autoRun);
  
  return {
    healthScore: launchReadiness.healthScore,
    status: launchReadiness.status,
    results: launchReadiness.results,
    isRunning: launchReadiness.isRunning,
    isComplete: launchReadiness.isComplete,
    isError: launchReadiness.isError,
  };
}

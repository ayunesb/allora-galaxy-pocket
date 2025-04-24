
import { useState } from "react";
import { useSecurityAudit } from "./useSecurityAudit";
import { useSystemLogs } from "@/hooks/useSystemLogs";

interface SecurityScores {
  high: number;
  medium: number;
  low: number;
}

export function useSecurityDashboard() {
  const { runSecurityAudit, isLoading: isScanning, issues: results } = useSecurityAudit();
  const { logs } = useSystemLogs();
  
  // Filter for security-related logs only
  const securityLogs = logs.filter(log => 
    log.event_type.startsWith('SECURITY_') || 
    log.event_type.includes('AUTH_') ||
    log.event_type.includes('ACCESS_')
  );

  // Calculate overall security score
  const calculateOverallScore = () => {
    if (!results.length) return 0;
    const sum = results.reduce((total, item) => total + item.securityScore, 0);
    return Math.round(sum / results.length);
  };

  // Count tables by security level
  const getSecurityScores = (): SecurityScores => {
    const counts = { high: 0, medium: 0, low: 0 };
    results.forEach(item => {
      if (item.securityScore >= 80) counts.high++;
      else if (item.securityScore >= 40) counts.medium++;
      else counts.low++;
    });
    return counts;
  };

  const overallScore = calculateOverallScore();
  const securityScores = getSecurityScores();
  const lastEventDate = securityLogs[0]?.created_at 
    ? new Date(securityLogs[0].created_at).toLocaleString() 
    : undefined;

  const hasCriticalIssues = results.some(r => r.securityScore < 40);
  const criticalIssuesCount = results.filter(r => r.securityScore < 40).length;

  return {
    runSecurityAudit,
    isScanning,
    results,
    overallScore,
    securityScores,
    securityLogs,
    lastEventDate,
    hasCriticalIssues,
    criticalIssuesCount
  };
}

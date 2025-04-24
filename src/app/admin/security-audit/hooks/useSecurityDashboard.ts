
import { useState } from "react";
import { useSecurityAudit, SecurityAuditIssue } from "./useSecurityAudit";
import { useSystemLogs } from "@/hooks/useSystemLogs";

interface SecurityScores {
  high: number;
  medium: number;
  low: number;
}

// Define the structure expected by our components
interface SecurityAuditResult {
  tableName: string;
  securityScore: number;
  hasRls: boolean;
  hasTenantId: boolean;
  hasAuthPolicies: boolean;
  recommendations: string[];
}

export function useSecurityDashboard() {
  const { runSecurityAudit, isLoading: isScanning, issues } = useSecurityAudit();
  const { logs } = useSystemLogs();
  const [results, setResults] = useState<SecurityAuditResult[]>([]);
  
  // Filter for security-related logs only
  const securityLogs = logs.filter(log => 
    log.event_type.startsWith('SECURITY_') || 
    log.event_type.includes('AUTH_') ||
    log.event_type.includes('ACCESS_')
  );

  // Transform SecurityAuditIssue to SecurityAuditResult
  const transformSecurityIssues = (issues: SecurityAuditIssue[]): SecurityAuditResult[] => {
    return issues.map(issue => {
      // Map each issue to our expected format
      let securityScore = 0;
      const hasRls = issue.type !== 'rls_disabled';
      const hasAuthPolicies = issue.type !== 'incomplete_rls';
      
      // Calculate a security score based on issue type
      if (issue.type === 'security_definer_view') {
        securityScore = 60; // Medium risk
      } else if (issue.type === 'rls_disabled') {
        securityScore = 20; // High risk
      } else if (issue.type === 'incomplete_rls') {
        securityScore = 40; // Medium-high risk
      }
      
      return {
        tableName: issue.name,
        securityScore,
        hasRls,
        hasTenantId: true, // We don't have this information in the issue, defaulting to true
        hasAuthPolicies,
        recommendations: [issue.remediation]
      };
    });
  };
  
  // Update runSecurityAudit to transform issues into our expected format
  const runAuditAndTransform = async () => {
    await runSecurityAudit();
    setResults(transformSecurityIssues(issues));
  };

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
    runSecurityAudit: runAuditAndTransform,
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

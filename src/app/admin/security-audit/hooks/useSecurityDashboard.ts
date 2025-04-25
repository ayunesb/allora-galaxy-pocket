
import { useState, useEffect } from 'react';
import { useSecurityAudit } from './useSecurityAudit';
import { supabase } from '@/integrations/supabase/client';

// Define proper types
export interface SecurityScores {
  critical: number;
  high: number;
  medium: number;
  low: number;
  warning: number;
  good: number;
  excellent: number;
}

export function useSecurityDashboard() {
  const { issues, isLoading, error, runSecurityAudit } = useSecurityAudit();
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [lastEventDate, setLastEventDate] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  
  // Load audit results whenever issues change
  useEffect(() => {
    // Transform issues into results format expected by the dashboard
    const transformedResults = issues.map(issue => ({
      tableName: issue.name,
      securityScore: calculateScoreForIssue(issue),
      hasRls: !issue.type.includes('rls_disabled'),
      hasTenantId: !issue.detail.includes('tenant_id'),
      hasAuthPolicies: !issue.type.includes('incomplete_rls'),
      recommendations: [issue.remediation]
    }));
    
    setResults(transformedResults);
  }, [issues]);
  
  // Helper function to calculate security score based on issue type
  const calculateScoreForIssue = (issue: any): number => {
    switch (issue.type) {
      case 'rls_disabled':
        return 20;
      case 'incomplete_rls':
        return 50;
      case 'security_definer_view':
        return 70;
      default:
        return 90;
    }
  };
  
  // Compute overall security score
  const overallScore = results.length 
    ? Math.round(results.reduce((acc, curr) => acc + curr.securityScore, 0) / results.length)
    : 0;
  
  // Security scores distribution
  const securityScores: SecurityScores = {
    critical: results.filter(r => r.securityScore < 40).length,
    high: 0, // Added to match the expected interface
    medium: 0, // Added to match the expected interface
    low: 0, // Added to match the expected interface
    warning: results.filter(r => r.securityScore >= 40 && r.securityScore < 70).length,
    good: results.filter(r => r.securityScore >= 70 && r.securityScore < 90).length,
    excellent: results.filter(r => r.securityScore >= 90).length,
  };
  
  // Critical issues flag
  const hasCriticalIssues = securityScores.critical > 0;
  const criticalIssuesCount = securityScores.critical;
  
  // Fetch security logs
  useEffect(() => {
    const fetchSecurityLogs = async () => {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .ilike('event_type', 'SECURITY_%')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (!error && data) {
        setSecurityLogs(data);
        if (data.length > 0) {
          setLastEventDate(new Date(data[0].created_at).toLocaleString());
        }
      }
    };
    
    fetchSecurityLogs();
  }, []);
  
  return {
    overallScore,
    securityScores,
    securityLogs,
    lastEventDate,
    hasCriticalIssues,
    criticalIssuesCount,
    results,
    isScanning: isLoading,
    runSecurityAudit
  };
}

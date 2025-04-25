
import { useState, useEffect } from 'react';
import { useSecurityAudit } from './useSecurityAudit';
import { supabase } from '@/integrations/supabase/client';

export function useSecurityDashboard() {
  const { results, isScanning, runSecurityAudit } = useSecurityAudit();
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [lastEventDate, setLastEventDate] = useState<string | null>(null);
  
  // Compute overall security score
  const overallScore = results.length 
    ? Math.round(results.reduce((acc, curr) => acc + curr.securityScore, 0) / results.length)
    : 0;
  
  // Security scores distribution
  const securityScores = {
    critical: results.filter(r => r.securityScore < 40).length,
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
    isScanning,
    runSecurityAudit
  };
}


import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type SecurityIssue = {
  severity: 'high' | 'medium' | 'low';
  table: string;
  issue: string;
  recommendation: string;
};

export function SecurityHealthCheck() {
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSecurityCheck = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check for tables without RLS enabled
      const { data: tablesWithoutRls, error: rlsError } = await supabase.rpc('get_tables_without_rls');
      
      if (rlsError) {
        setError("Error checking RLS: " + rlsError.message);
        return;
      }
      
      const securityIssues: SecurityIssue[] = [];
      
      // Process tables without RLS
      if (tablesWithoutRls && tablesWithoutRls.length > 0) {
        tablesWithoutRls.forEach(table => {
          securityIssues.push({
            severity: 'high',
            table: table.table_name,
            issue: 'Row Level Security is not enabled',
            recommendation: `Enable RLS on table "${table.table_name}" to prevent unauthorized data access.`
          });
        });
      }
      
      // Check for incomplete RLS policies
      const { data: incompletePolicies, error: policiesError } = await supabase.rpc('get_incomplete_rls_policies');
      
      if (policiesError) {
        setError("Error checking RLS policies: " + policiesError.message);
        return;
      }
      
      if (incompletePolicies && incompletePolicies.length > 0) {
        incompletePolicies.forEach(policy => {
          securityIssues.push({
            severity: 'medium',
            table: policy.tablename,
            issue: `Policy "${policy.policyname}" may not be using auth.uid()`,
            recommendation: 'Review policy to ensure proper authorization checks are in place.'
          });
        });
      }
      
      setIssues(securityIssues);
      setHasRun(true);
    } catch (e: any) {
      setError(e.message || 'Failed to run security check');
      console.error("Security check error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSecurityCheck();
  }, []);

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Health Check
        </CardTitle>
        <CardDescription>
          Scan your database for security configuration issues
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>Running security checks...</p>
            <div className="mt-2 animate-pulse w-full bg-muted h-2 rounded-full"></div>
          </div>
        ) : hasRun && issues.length === 0 ? (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Security Configuration Looks Good</AlertTitle>
            <AlertDescription>
              No major security issues were detected in your database configuration.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {issues.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-sm font-medium">Found {issues.length} potential security {issues.length === 1 ? 'issue' : 'issues'}</p>
                
                {issues.map((issue, idx) => (
                  <Alert key={idx} className={severityColor(issue.severity) + ' border'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{issue.table}: {issue.issue}</AlertTitle>
                    <AlertDescription className="mt-1 text-sm">
                      {issue.recommendation}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={runSecurityCheck} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              Run Security Check Again
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

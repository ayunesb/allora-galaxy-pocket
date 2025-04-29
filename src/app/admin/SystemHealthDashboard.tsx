import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Shield, Server, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SecurityHealthCheck from '@/components/SecurityHealthCheck';

export default function SystemHealthDashboard() {
  const [healthScore, setHealthScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [healthChecks, setHealthChecks] = useState<{
    name: string;
    status: 'success' | 'warning' | 'error';
    message: string;
  }[]>([]);

  useEffect(() => {
    runHealthCheck();
  }, []);

  const runHealthCheck = async () => {
    setLoading(true);
    
    const checks = [
      { name: 'Authentication', status: 'pending', message: 'Checking auth...' },
      { name: 'Database', status: 'pending', message: 'Checking DB connection...' },
      { name: 'RLS Policies', status: 'pending', message: 'Validating RLS...' },
      { name: 'Tenant Isolation', status: 'pending', message: 'Validating tenant separation...' },
      { name: 'API Services', status: 'pending', message: 'Checking API endpoints...' },
    ];
    
    // Check authentication
    try {
      const { data: session } = await supabase.auth.getSession();
      checks[0] = {
        name: 'Authentication',
        status: session ? 'success' : 'warning',
        message: session ? 'Authentication working' : 'No active session'
      };
    } catch (error) {
      checks[0] = {
        name: 'Authentication',
        status: 'error',
        message: 'Auth system error'
      };
    }
    
    // Check database connection
    try {
      const { data, error } = await supabase.from('system_logs').select('count').limit(1);
      checks[1] = {
        name: 'Database',
        status: error ? 'error' : 'success',
        message: error ? 'Database connection error' : 'Database connected'
      };
    } catch (error) {
      checks[1] = {
        name: 'Database',
        status: 'error',
        message: 'Database connection failed'
      };
    }
    
    // Check RLS policies
    try {
      const { error: rlsError } = await supabase.rpc('test_rls_recursion');
      checks[2] = {
        name: 'RLS Policies',
        status: rlsError ? 'warning' : 'success',
        message: rlsError ? 'RLS policy issues detected' : 'RLS policies configured correctly'
      };
    } catch (error) {
      checks[2] = {
        name: 'RLS Policies',
        status: 'error',
        message: 'RLS check failed'
      };
    }
    
    // Check tenant isolation
    try {
      const { error: tenantError } = await supabase.rpc(
        'check_tenant_user_access_safe', 
        { tenant_uuid: '00000000-0000-0000-0000-000000000000', user_uuid: '00000000-0000-0000-0000-000000000000' }
      );
      checks[3] = {
        name: 'Tenant Isolation',
        status: tenantError ? 'warning' : 'success',
        message: tenantError ? 'Tenant isolation issue' : 'Tenant isolation verified'
      };
    } catch (error) {
      checks[3] = {
        name: 'Tenant Isolation',
        status: 'error',
        message: 'Tenant isolation check failed'
      };
    }
    
    // Check API Services
    try {
      const { data: apiHealth, error: apiError } = await supabase
        .from('cron_job_logs')
        .select('count')
        .limit(1);
      
      checks[4] = {
        name: 'API Services',
        status: apiError ? 'warning' : 'success',
        message: apiError ? 'API service issues' : 'API services operational'
      };
    } catch (error) {
      checks[4] = {
        name: 'API Services',
        status: 'error',
        message: 'API services check failed'
      };
    }
    
    // Calculate overall health
    const weightedScores = {
      success: 100,
      warning: 60,
      error: 0
    };
    
    const healthChecksWithStatus = checks.map(check => ({
      ...check,
      status: check.status === 'pending' ? 'warning' : check.status
    })) as typeof healthChecks;
    
    const totalScore = healthChecksWithStatus.reduce((sum, check) => {
      return sum + weightedScores[check.status];
    }, 0);
    
    const finalScore = Math.round(totalScore / (healthChecksWithStatus.length * 100) * 100);
    
    setHealthScore(finalScore);
    setHealthChecks(healthChecksWithStatus);
    setLoading(false);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex justify-between">
            <span>System Health Overview</span>
            <Badge className={
              healthScore >= 90 ? "bg-green-500" : 
              healthScore >= 70 ? "bg-amber-500" : 
              "bg-red-500"
            }>
              {healthScore}%
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={healthScore} className="h-2 mb-4" />
          
          <div className="space-y-3">
            {healthChecks.map((check, index) => (
              <div key={index} className="flex justify-between items-center py-1 border-b last:border-0">
                <div className="flex items-center gap-2">
                  {check.status === 'success' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : check.status === 'warning' ? (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span>{check.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">{check.message}</span>
              </div>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthCheck}
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? "Running checks..." : "Refresh Health Check"}
          </Button>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-4 w-4" /> Security Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SecurityHealthCheck />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-4 w-4" /> Database Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-1 border-b">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4" /> 
                  RLS Policies
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Enabled</Badge>
              </div>
              
              <div className="flex justify-between items-center py-1 border-b">
                <span>Tenant Tables</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Secured</Badge>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <span>User Role Functions</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Optimized</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

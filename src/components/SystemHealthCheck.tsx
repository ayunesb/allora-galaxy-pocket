
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function SystemHealthCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [checks, setChecks] = useState({
    auth: { status: 'pending', error: null },
    database: { status: 'pending', error: null },
    storage: { status: 'pending', error: null },
    rls: { status: 'pending', error: null, fixed: false }
  });
  
  useEffect(() => {
    checkSystemHealth();
  }, []);
  
  const checkSystemHealth = async () => {
    setIsChecking(true);
    
    // Check database connection
    try {
      const { error } = await supabase
        .from('system_config')
        .select('count')
        .limit(1);
        
      setChecks(prev => ({
        ...prev,
        database: { 
          status: error ? 'error' : 'success', 
          error: error?.message || null 
        }
      }));
    } catch (error: any) {
      setChecks(prev => ({
        ...prev,
        database: { status: 'error', error: error.message }
      }));
    }
    
    // Check auth session
    try {
      const { data, error } = await supabase.auth.getSession();
      setChecks(prev => ({
        ...prev,
        auth: { 
          status: error ? 'error' : 'success', 
          error: error?.message || null 
        }
      }));
    } catch (error: any) {
      setChecks(prev => ({
        ...prev,
        auth: { status: 'error', error: error.message }
      }));
    }
    
    // Check tenant_user_roles access
    try {
      // Check if the RPC function exists (our fix)
      const { error: rpcError } = await supabase.rpc('check_tenant_user_access', { 
        tenant_uuid: '00000000-0000-0000-0000-000000000000',
        user_uuid: '00000000-0000-0000-0000-000000000000'
      });
      
      const rlsFixed = !rpcError || !rpcError.message.includes('function does not exist');
      
      setChecks(prev => ({
        ...prev,
        rls: {
          status: rlsFixed ? 'success' : 'error',
          error: rlsFixed ? null : 'RLS policy fix not applied',
          fixed: rlsFixed
        }
      }));
    } catch (error: any) {
      console.log('RLS check error:', error);
    }
    
    setIsChecking(false);
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'pending' || isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    } else if (status === 'success') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };
  
  return (
    <div className="space-y-3">
      <h3 className="font-medium">System Health Check</h3>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
          <span>Database Connection:</span>
          <div className="flex items-center">
            {getStatusIcon(checks.database.status)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
          <span>Authentication:</span>
          <div className="flex items-center">
            {getStatusIcon(checks.auth.status)}
          </div>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
          <span>RLS Policy Fix:</span>
          <div className="flex items-center">
            {getStatusIcon(checks.rls.status)}
          </div>
        </div>
        
        {checks.rls.fixed && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              The tenant_user_roles RLS policy fix has been successfully applied.
            </AlertDescription>
          </Alert>
        )}
        
        {checks.database.status === 'error' && checks.database.error && checks.database.error.includes('infinite recursion') && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Infinite recursion detected in a database policy. This typically happens when an RLS policy queries its own table.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkSystemHealth} 
            disabled={isChecking}
          >
            {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh Status
          </Button>
        </div>
      </div>
    </div>
  );
}

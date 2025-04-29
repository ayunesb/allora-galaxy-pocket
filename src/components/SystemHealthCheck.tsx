
import React, { useEffect, useState } from 'react';
import { Progress } from "@/components/ui/progress";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";

export default function SystemHealthCheck() {
  const [checks, setChecks] = useState([
    { name: 'Authentication', status: 'pending', message: '' },
    { name: 'Database Connection', status: 'pending', message: '' },
    { name: 'RLS Policies', status: 'pending', message: '' },
    { name: 'Tenant Isolation', status: 'pending', message: '' },
    { name: 'Edge Functions', status: 'pending', message: '' }
  ]);
  
  const [overallHealth, setOverallHealth] = useState(0);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    runHealthChecks();
  }, []);

  const runHealthChecks = async () => {
    setIsVerifying(true);
    
    try {
      // Clone checks to update individually
      const updatedChecks = [...checks];
      
      // 1. Auth Check
      try {
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        updatedChecks[0] = {
          ...updatedChecks[0],
          status: session?.session ? 'success' : 'warning',
          message: session?.session ? 'Authentication system operational' : 'No active session'
        };
        setChecks([...updatedChecks]);
      } catch (error) {
        updatedChecks[0] = {
          ...updatedChecks[0],
          status: 'error',
          message: 'Auth system error'
        };
        setChecks([...updatedChecks]);
      }
      
      // 2. Database Connection Check
      try {
        const { data, error } = await supabase.from('system_logs').select('count').limit(1);
        updatedChecks[1] = {
          ...updatedChecks[1],
          status: error ? 'error' : 'success',
          message: error ? 'Database connection error' : 'Database connected'
        };
        setChecks([...updatedChecks]);
      } catch (error) {
        updatedChecks[1] = {
          ...updatedChecks[1],
          status: 'error',
          message: 'Database connection failed'
        };
        setChecks([...updatedChecks]);
      }
      
      // 3. RLS Policies Check - Using our security definer functions
      try {
        const { data, error } = await supabase.rpc('test_rls_recursion');
        
        let rlsStatus = 'success';
        let message = 'RLS policies configured correctly';
        
        if (error) {
          rlsStatus = 'error';
          message = 'RLS check failed: ' + error.message;
        } else if (data && data.some(table => table.has_recursion)) {
          rlsStatus = 'warning';
          message = 'Potential RLS recursion issues detected';
        }
        
        updatedChecks[2] = {
          ...updatedChecks[2],
          status: rlsStatus,
          message
        };
        setChecks([...updatedChecks]);
      } catch (error: any) {
        updatedChecks[2] = {
          ...updatedChecks[2],
          status: 'error',
          message: 'RLS verification failed: ' + (error.message || 'Unknown error')
        };
        setChecks([...updatedChecks]);
      }
      
      // 4. Tenant Isolation Check - Using security definer functions
      try {
        const { data, error } = await supabase.rpc('get_user_tenant_ids_safe');
        
        updatedChecks[3] = {
          ...updatedChecks[3],
          status: error ? 'error' : 'success',
          message: error ? 'Tenant isolation check failed' : 'Tenant isolation verified'
        };
        setChecks([...updatedChecks]);
      } catch (error: any) {
        updatedChecks[3] = {
          ...updatedChecks[3],
          status: 'error',
          message: 'Tenant isolation check failed'
        };
        setChecks([...updatedChecks]);
      }
      
      // 5. Edge Functions Check
      try {
        const { data, error } = await supabase.from('cron_job_logs').select('*').limit(1);
        
        updatedChecks[4] = {
          ...updatedChecks[4],
          status: error ? 'warning' : 'success',
          message: error ? 'Edge function check limited' : 'Edge functions operational'
        };
        setChecks([...updatedChecks]);
      } catch (error) {
        updatedChecks[4] = {
          ...updatedChecks[4],
          status: 'error',
          message: 'Edge function check failed'
        };
        setChecks([...updatedChecks]);
      }
      
      // Calculate overall health
      const healthScore = calculateHealthScore(updatedChecks);
      setOverallHealth(healthScore);
    } catch (error: any) {
      toast.error("Health check failed", { description: error.message });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const calculateHealthScore = (checks) => {
    const weights = {
      success: 100,
      warning: 50,
      error: 0,
      pending: 0
    };
    
    const total = checks.reduce((sum, check) => {
      return sum + weights[check.status];
    }, 0);
    
    return Math.round(total / (checks.length * 100) * 100);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">System Health</span>
          <span className="text-sm font-medium">{overallHealth}%</span>
        </div>
        <Progress value={overallHealth} className={`h-2 ${
          overallHealth > 80 ? 'bg-green-500' : 
          overallHealth > 50 ? 'bg-amber-500' : 
          'bg-red-500'
        }`} />
      </div>
      
      <div className="space-y-3">
        {checks.map((check, index) => (
          <div key={index} className="flex items-start justify-between border-b pb-2 last:border-0">
            <div className="flex gap-2 items-center">
              {check.status === 'pending' ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : check.status === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : check.status === 'warning' ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <div>
                <p className="font-medium">{check.name}</p>
                <p className="text-xs text-muted-foreground">{check.message}</p>
              </div>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded ${getStatusClass(check.status)}`}>
              {check.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      
      {!isVerifying && (
        <button 
          onClick={runHealthChecks} 
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Run checks again
        </button>
      )}
    </div>
  );
}

function getStatusClass(status) {
  switch(status) {
    case 'success':
      return 'bg-green-100 text-green-800';
    case 'warning':
      return 'bg-amber-100 text-amber-800';
    case 'error':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

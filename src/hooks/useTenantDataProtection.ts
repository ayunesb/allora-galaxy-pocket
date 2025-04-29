
import { useState } from 'react';
import { useTenant } from './useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useSystemLogs } from './useSystemLogs';
import { ToastService } from '@/services/ToastService';

export function useTenantDataProtection() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();
  
  const runDataVerification = async () => {
    if (!tenant?.id) {
      ToastService.error("No tenant selected");
      return { success: false, message: "No tenant selected" };
    }
    
    setIsLoading(true);
    
    try {
      // First, verify tenant isolation
      const { data: verificationResult, error } = await supabase
        .rpc('verify_tenant_isolation', { tenant_uuid: tenant.id });
        
      if (error) throw error;
      
      await logActivity(
        'DATA_PROTECTION_CHECK',
        'Tenant isolation verification run',
        {
          tenant_id: tenant.id,
          result: verificationResult
        },
        'info'
      );
      
      if (Array.isArray(verificationResult)) {
        // Handle array result format
        const failedChecks = verificationResult.filter(check => !check.success);
        
        if (failedChecks.length > 0) {
          const messages = failedChecks.map(check => check.message).join(', ');
          return { success: false, message: `Verification failed: ${messages}` };
        } else {
          return { success: true, message: "All checks passed" };
        }
      } else if (verificationResult && typeof verificationResult === 'object') {
        // Handle object result format
        return { 
          success: verificationResult.success as boolean, 
          message: verificationResult.message as string 
        };
      }
      
      return { success: true, message: "Verification completed" };
    } catch (error: any) {
      console.error('Data verification error:', error);
      
      await logActivity(
        'DATA_PROTECTION_ERROR',
        'Tenant isolation verification failed',
        {
          tenant_id: tenant.id,
          error: error.message
        },
        'error'
      );
      
      return { success: false, message: error.message || "Verification failed" };
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportTenantData = async () => {
    if (!tenant?.id) {
      ToastService.error("No tenant selected");
      return { success: false };
    }
    
    setIsLoading(true);
    
    try {
      // Log the export request
      await logActivity(
        'DATA_EXPORT_REQUESTED',
        'Tenant data export requested',
        {
          tenant_id: tenant.id
        },
        'info'
      );
      
      // Here would be the logic to fetch all tenant data
      // This is a placeholder for now
      const { data: exportData, error } = await supabase
        .from('export_logs')
        .insert({
          tenant_id: tenant.id,
          export_type: 'full_data',
          user_id: (await supabase.auth.getUser()).data.user?.id,
          delivery_method: 'download',
          status: 'pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      ToastService.success({
        title: "Export initiated",
        description: "Your data export has been scheduled. You'll receive a notification when it's ready."
      });
      
      return { success: true, exportId: exportData.id };
    } catch (error: any) {
      console.error('Data export error:', error);
      
      ToastService.error({
        title: "Export failed",
        description: error.message || "Failed to schedule data export"
      });
      
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    runDataVerification,
    exportTenantData,
    isLoading
  };
}

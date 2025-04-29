
import { useMemo } from 'react';
import { useTenant } from './useTenant';

export function useRolePermissions() {
  const { tenant, userRole } = useTenant();
  
  const permissions = useMemo(() => {
    // Default to viewer permissions if no role is set
    const role = userRole || 'viewer';
    
    return {
      canReadData: true, // All roles can read data
      canWriteData: role === 'admin' || role === 'editor',
      canApproveStrategies: role === 'admin' || role === 'editor',
      canManageUsers: role === 'admin',
      canViewAdminPanel: role === 'admin',
      canViewReports: role === 'admin' || role === 'editor' || role === 'analyst',
      canManageSettings: role === 'admin',
      canManagePlugins: role === 'admin',
      canManageBilling: role === 'admin',
      canExportData: role === 'admin' || role === 'editor' || role === 'analyst',
      role
    };
  }, [userRole]);
  
  return permissions;
}

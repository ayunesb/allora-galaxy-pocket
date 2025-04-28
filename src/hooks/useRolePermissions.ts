
import { useMemo } from 'react';
import { useTenant } from './useTenant';
import { useAuth } from './useAuth';

export function useRolePermissions() {
  const { user } = useAuth();
  const { tenant, userRole } = useTenant();
  
  const permissions = useMemo(() => {
    const isAdmin = userRole === 'admin';
    const isEditor = userRole === 'editor' || isAdmin;
    const isContributor = userRole === 'contributor' || isEditor;
    
    return {
      canManageUsers: isAdmin,
      canManagePlugins: isAdmin || isEditor,
      canCreateStrategy: isContributor,
      canApproveStrategy: isEditor,
      canViewAnalytics: true,
      canEditSettings: isAdmin
    };
  }, [userRole]);
  
  return permissions;
}

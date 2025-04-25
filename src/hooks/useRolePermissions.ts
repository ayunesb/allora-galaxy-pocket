
import { useUserRole } from "./useUserRole";

export function useRolePermissions() {
  const { role } = useUserRole();
  
  const isAdmin = role === 'admin';
  const isDeveloper = role === 'developer';
  const isClient = role === 'client';
  const isViewer = role === 'viewer';
  
  const canEditStrategies = isAdmin || isDeveloper;
  const canApproveStrategies = isAdmin || isDeveloper;
  const canManageUsers = isAdmin;
  const canAccessAdminArea = isAdmin;
  const canAccessDeveloperTools = isAdmin || isDeveloper;
  const canConfigureSystem = isAdmin;
  const canViewAuditLogs = isAdmin;
  
  return {
    isAdmin,
    isDeveloper,
    isClient,
    isViewer,
    canEditStrategies,
    canApproveStrategies,
    canManageUsers,
    canAccessAdminArea,
    canAccessDeveloperTools,
    canConfigureSystem,
    canViewAuditLogs
  };
}

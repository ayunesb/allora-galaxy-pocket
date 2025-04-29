
import { useTenant } from "./useTenant";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export function useRolePermissions() {
  const { tenant, userRole } = useTenant();
  
  // Define role-based permissions
  const roles: Record<string, Role> = {
    admin: {
      id: 'admin',
      name: 'Administrator',
      permissions: [
        { id: 'view_all', name: 'View All', description: 'Can view all resources' },
        { id: 'edit_all', name: 'Edit All', description: 'Can edit all resources' },
        { id: 'delete_all', name: 'Delete All', description: 'Can delete all resources' },
        { id: 'manage_users', name: 'Manage Users', description: 'Can manage users' },
        { id: 'manage_plugins', name: 'Manage Plugins', description: 'Can manage plugins' }
      ]
    },
    editor: {
      id: 'editor',
      name: 'Editor',
      permissions: [
        { id: 'view_all', name: 'View All', description: 'Can view all resources' },
        { id: 'edit_own', name: 'Edit Own', description: 'Can edit own resources' }
      ]
    },
    viewer: {
      id: 'viewer',
      name: 'Viewer',
      permissions: [
        { id: 'view_all', name: 'View All', description: 'Can view all resources' }
      ]
    }
  };
  
  // Get current role permissions
  const currentRole = userRole || 'viewer';
  const rolePermissions = roles[currentRole] || roles.viewer;
  
  // Check if user has specific permission
  const hasPermission = (permissionId: string): boolean => {
    return rolePermissions.permissions.some(p => p.id === permissionId);
  };
  
  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionIds: string[]): boolean => {
    return permissionIds.some(id => hasPermission(id));
  };
  
  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionIds: string[]): boolean => {
    return permissionIds.every(id => hasPermission(id));
  };

  // Helper for common permission checks
  const canManageUsers = hasPermission('manage_users');
  const canManagePlugins = hasPermission('manage_plugins');
  
  return {
    currentRole,
    permissions: rolePermissions.permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: currentRole === 'admin',
    canManageUsers,
    canManagePlugins
  };
}

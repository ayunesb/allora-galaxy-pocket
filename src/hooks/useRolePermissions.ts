
import { useRole } from './useRole';
import { UserRole } from '@/types/invite';

export function useRolePermissions() {
  const { role } = useRole();
  
  const canEdit = role === 'admin' || role === 'editor';
  const isAdmin = role === 'admin';
  const canManageUsers = isAdmin;
  const canManagePlugins = isAdmin;
  const canApproveContent = isAdmin || role === 'editor';
  
  return {
    canEdit,
    isAdmin,
    canManageUsers,
    canManagePlugins,
    canApproveContent,
    role
  };
}

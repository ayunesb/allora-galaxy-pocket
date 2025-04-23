
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

// Maps allowedRoles to the canonical role values in user_roles
export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/startup'
}: RoleGuardProps) {
  const { role, isLoading } = useUserRole();

  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
}

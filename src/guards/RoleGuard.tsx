
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { UserRole } from '@/types/invite';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackPath = '/startup'
}: RoleGuardProps) {
  const { role, isLoading } = useRole();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
}

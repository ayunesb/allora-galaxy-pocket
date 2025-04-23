
import { ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from "@/hooks/use-toast";

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
  const navigate = useNavigate();
  const redirectedRef = useRef(false);

  useEffect(() => {
    // If role is loaded, user is not allowed, and we haven't redirected yet
    if (!isLoading && role && !allowedRoles.includes(role) && !redirectedRef.current) {
      redirectedRef.current = true;
      toast.error("Access denied. Redirecting to dashboard.");
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1500);
    }
  }, [isLoading, role, allowedRoles, navigate]);

  if (isLoading) {
    return null; // Optionally render a loading spinner
  }

  // If user is not allowed, render nothing while redirecting
  if (!role || !allowedRoles.includes(role)) {
    return null;
  }
  
  return <>{children}</>;
}

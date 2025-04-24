
import { ReactNode, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { toast } from "@/hooks/use-toast";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export default function RoleGuard({ 
  children, 
  allowedRoles,
  fallbackPath = '/dashboard'
}: RoleGuardProps) {
  const { checkAccess } = useRoleAccess();
  const navigate = useNavigate();
  const redirectedRef = useRef(false);

  useEffect(() => {
    const validateAccess = async () => {
      const hasAccess = await Promise.all(
        allowedRoles.map(role => checkAccess(role))
      );

      if (!hasAccess.some(access => access) && !redirectedRef.current) {
        redirectedRef.current = true;
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
        navigate(fallbackPath, { replace: true });
      }
    };

    validateAccess();
  }, [allowedRoles, checkAccess, navigate, fallbackPath]);

  return <>{children}</>;
}

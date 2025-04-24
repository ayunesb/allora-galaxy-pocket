
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const [isVerifying, setIsVerifying] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const { tenant } = useTenant();
  const { user } = useAuth();

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setIsVerifying(true);
        
        const accessResults = await Promise.all(
          allowedRoles.map(role => checkAccess(role))
        );
        
        const hasAccess = accessResults.some(access => access);
        
        if (!hasAccess && !redirectedRef.current) {
          redirectedRef.current = true;
          
          if (user?.id && tenant?.id) {
            await supabase.from('system_logs').insert({
              event_type: 'SECURITY_UNAUTHORIZED_ACCESS',
              message: `Unauthorized attempt to access restricted route requiring ${allowedRoles.join(', ')} role`,
              user_id: user.id,
              tenant_id: tenant.id,
              meta: {
                requiredRoles: allowedRoles,
                path: window.location.pathname
              }
            });
          }
          
          toast({
            description: "You don't have permission to access this page"
          });
          
          navigate(fallbackPath, { replace: true });
        } else {
          setAccessGranted(true);
        }
      } catch (error) {
        console.error("Role validation error:", error);
        toast({
          description: "There was a problem verifying your permissions"
        });
        navigate(fallbackPath, { replace: true });
      } finally {
        setIsVerifying(false);
      }
    };

    validateAccess();
  }, [allowedRoles, checkAccess, navigate, fallbackPath, user, tenant]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-4 border border-destructive/50 rounded-md bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive mb-2" />
        <h3 className="font-semibold">Access Denied</h3>
        <p className="text-sm text-center text-muted-foreground mt-1">
          You don't have the required permissions to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

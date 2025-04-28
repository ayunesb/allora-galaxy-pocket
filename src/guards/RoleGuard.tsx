
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { toast } from "sonner";
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
  const [error, setError] = useState<string | null>(null);
  const { tenant } = useTenant();
  const { user } = useAuth();

  useEffect(() => {
    const validateAccess = async () => {
      try {
        setIsVerifying(true);
        setError(null);
        
        // Handle the case when there's no user or tenant
        if (!user?.id || !tenant?.id) {
          setIsVerifying(false);
          setAccessGranted(false);
          return;
        }
        
        // Verify tenant access first
        const { data: hasAccess, error: accessError } = await supabase.rpc(
          "check_tenant_user_access_safe",
          { tenant_uuid: tenant.id, user_uuid: user.id }
        );
        
        if (accessError || !hasAccess) {
          setError(accessError?.message || "No access to this tenant");
          setAccessGranted(false);
          setIsVerifying(false);
          return;
        }
        
        // Then check role-based access
        const accessResults = await Promise.all(
          allowedRoles.map(role => checkAccess(role))
        );
        
        const hasRoleAccess = accessResults.some(access => access);
        
        if (!hasRoleAccess && !redirectedRef.current) {
          redirectedRef.current = true;
          
          try {
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
          } catch (logError) {
            console.error("Error logging security event:", logError);
          }
          
          toast(`You don't have permission to access this page`, {
            description: `Required role: ${allowedRoles.join(' or ')}`,
            duration: 5000
          });
          
          navigate(fallbackPath, { replace: true });
        } else {
          setAccessGranted(true);
        }
      } catch (error) {
        const errorMessage = (error as Error).message || "Unknown error";
        console.error("Role validation error:", error);
        setError(errorMessage);
        toast(`There was a problem verifying your permissions`, {
          description: errorMessage,
          duration: 5000
        });
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

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Access Error</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{error}</p>
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button size="sm" variant="default" onClick={() => navigate(fallbackPath)}>
              Go to Dashboard
            </Button>
          </div>
        </AlertDescription>
      </Alert>
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

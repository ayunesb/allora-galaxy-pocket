import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { Button } from '@/components/ui/button';

interface AdminOnlyProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Protection component that ensures only users with admin role can access the wrapped content
 * Redirects non-admin users to a specified route or displays an access denied message
 */
export default function AdminOnly({ 
  children, 
  redirectTo = "/dashboard" 
}: AdminOnlyProps) {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('is_admin');
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("Exception checking admin status:", err);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse text-muted-foreground">
          Verifying permissions...
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    // If redirectTo is provided, navigate to that route
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }
    
    // Otherwise show access denied message
    return (
      <div className="container mx-auto py-10 px-4">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <Shield className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            <p>You don't have permission to access this page.</p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}


import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useRouteAccess } from "@/hooks/useRouteAccess";
import { toast } from "sonner";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { canAccessRoute } = useRouteAccess();
  const [suggestedRoutes, setSuggestedRoutes] = useState<string[]>([]);

  useEffect(() => {
    // Log the 404 error for tracking
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // Send a toast notification
    toast.error("Page not found", {
      description: `The route "${location.pathname}" does not exist or you don't have access.`
    });

    // Generate suggested routes based on the current path
    const path = location.pathname;
    const suggestions: string[] = [];
    
    // Check if it's an admin route with a typo
    if (path.startsWith('/admin/')) {
      const commonAdminRoutes = [
        '/admin/dashboard',
        '/admin/analytics',
        '/admin/security-audit',
        '/admin/system-health',
        '/admin/logs',
        '/admin/campaign-performance'
      ];
      
      suggestions.push(...commonAdminRoutes);
    } else if (path.includes('campaign')) {
      suggestions.push('/campaigns/center', '/dashboard/insights', '/campaigns');
    } else if (path.includes('plugin')) {
      suggestions.push('/plugins', '/plugins/marketplace', '/plugins/submit');
    } else if (path === '/login') {
      suggestions.push('/auth/login');
    } else if (path.includes('login')) {
      suggestions.push('/auth/login');
    } else if (path.includes('signup')) {
      suggestions.push('/auth/signup', '/auth/register');
    } else if (path.includes('register')) {
      suggestions.push('/auth/register', '/auth/signup');
    } else if (path.includes('auth')) {
      suggestions.push('/auth/login', '/auth/register', '/auth/forgot-password');
    } else if (path.includes('dashboard')) {
      suggestions.push('/dashboard', '/dashboard/insights', '/dashboard/alerts');
    } else if (path.includes('strategy')) {
      suggestions.push('/strategy', '/vault', '/launch');
    } else if (path.includes('workspace')) {
      suggestions.push('/workspace', '/workspace/users');
    } else {
      suggestions.push('/dashboard', '/strategy', '/assistant', '/workspace');
    }
    
    // Filter to only routes the user can access
    const accessibleSuggestions = suggestions.filter(route => canAccessRoute(route));
    setSuggestedRoutes(accessibleSuggestions.slice(0, 4)); // Limit to 4 suggestions
  }, [location.pathname, canAccessRoute]);

  const goToStartup = () => {
    navigate("/dashboard");
  };

  const goBack = () => {
    navigate(-1);
  };

  const tryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 p-4">
      <div className="text-center p-8 bg-card dark:bg-gray-800 rounded-lg shadow-lg max-w-md border border-border w-full">
        <h1 className="text-7xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground dark:text-white mb-6">Page not found</p>
        <p className="text-muted-foreground dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or you may not have access to it.
          <br />
          <code className="text-sm bg-muted p-1 rounded mt-2 inline-block overflow-hidden text-ellipsis max-w-full">
            {location.pathname}
          </code>
        </p>
        
        {suggestedRoutes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">Did you mean to visit:</p>
            <div className="space-y-2">
              {suggestedRoutes.map((route) => (
                <Button 
                  key={route}
                  variant="outline" 
                  className="w-full text-left"
                  onClick={() => navigate(route)}
                >
                  {route}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          <Button 
            onClick={goBack}
            className="w-full flex items-center justify-center gap-2"
            variant="default"
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button 
            onClick={goToStartup} 
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <Home size={16} />
            Go to Dashboard
          </Button>
          <Button
            onClick={tryAgain}
            className="w-full flex items-center justify-center gap-2"
            variant="ghost"
          >
            <RefreshCw size={16} />
            Reload Page
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

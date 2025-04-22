
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const goToStartup = () => {
    navigate("/dashboard");
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
      <div className="text-center p-8 bg-card dark:bg-gray-800 rounded-lg shadow-lg max-w-md border border-border">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground dark:text-white mb-6">Page not found</p>
        <p className="text-muted-foreground dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
          <br />
          <code className="text-sm bg-muted p-1 rounded mt-2 inline-block">{location.pathname}</code>
        </p>
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
        </div>
      </div>
    </div>
  );
};

export default NotFound;

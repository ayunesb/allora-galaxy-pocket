
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, RefreshCw } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 p-4">
      <div className="text-center p-8 bg-card dark:bg-gray-800 rounded-lg shadow-lg max-w-md border border-border w-full">
        <h1 className="text-7xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground dark:text-white mb-6">Page not found</p>
        <p className="text-muted-foreground dark:text-gray-300 mb-8">
          The page you're looking for doesn't exist or you may not have access to it.
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2"
            variant="default"
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
          <Button 
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            <Home size={16} />
            Go to Dashboard
          </Button>
          <Button
            onClick={() => window.location.reload()}
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
}

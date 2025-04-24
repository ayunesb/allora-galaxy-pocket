
import React from 'react';
import { Card } from "@/components/ui/card";
import WorkspaceSwitcher from './WorkspaceSwitcher';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function WorkspacePage() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900">
        <LoadingSpinner size={40} label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl p-6 space-y-6 bg-card dark:bg-gray-800 border border-border dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Select a Workspace</h1>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <p className="text-muted-foreground dark:text-gray-300">
          Choose a workspace to continue or create a new one.
        </p>
        
        <div className="p-4 border rounded-md bg-muted/50 dark:bg-gray-700/30">
          <WorkspaceSwitcher highlight={true} />
        </div>
        
        <div className="text-sm text-muted-foreground dark:text-gray-400">
          <p>Workspaces help you organize your Allora OS experience and collaborate with your team members.</p>
        </div>
      </Card>
    </div>
  );
}

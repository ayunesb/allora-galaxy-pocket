
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ErrorAlertProps {
  title: string;
  description?: string;
  retry?: () => void;
}

export default function ErrorAlert({ title, description, retry }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
      
      {retry && (
        <div className="mt-4">
          <button 
            onClick={retry} 
            className="text-sm text-white underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}
    </Alert>
  );
}

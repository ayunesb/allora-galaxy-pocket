
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function TestSupabaseConnection() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkConnection = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Simple query to check connection
      const { data, error } = await supabase
        .from('system_config')
        .select('count(*)')
        .limit(1)
        .timeout(5000); // 5 second timeout
      
      if (error) {
        console.error('Supabase connection error:', error);
        setIsConnected(false);
        setErrorMessage(error.message);
      } else {
        setIsConnected(true);
      }
    } catch (err: any) {
      console.error('Connection test failed:', err);
      setIsConnected(false);
      setErrorMessage(err.message || 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className="mb-4">
      {isConnected === null ? (
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Testing database connection...</span>
        </div>
      ) : isConnected ? (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Connected to Supabase</AlertTitle>
          <AlertDescription>Database connection is working properly.</AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              {errorMessage || "Unable to connect to Supabase database."}
            </p>
            <Button 
              size="sm" 
              onClick={checkConnection} 
              disabled={isLoading} 
              className="flex items-center gap-1"
            >
              {isLoading ? (
                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-3 w-3 mr-1" />
              )}
              Retry Connection
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

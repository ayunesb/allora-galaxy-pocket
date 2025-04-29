
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function TestSupabaseConnection() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simple query to check if we can connect to Supabase
      const { data, error } = await supabase
        .from('system_logs')
        .select('count')
        .limit(1);
        
      if (error) {
        throw error;
      }
      
      setIsConnected(true);
    } catch (err: any) {
      console.error('Supabase connection error:', err);
      setIsConnected(false);
      setError(err.message || 'Failed to connect to Supabase');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Testing Supabase connection...</span>
        </div>
      ) : isConnected ? (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Connected</AlertTitle>
          <AlertDescription>
            Successfully connected to Supabase.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Connection Failed</AlertTitle>
          <AlertDescription>
            {error || 'Could not connect to Supabase. Please check your configuration.'}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={testConnection}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Test Connection
      </Button>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SupabaseConnectionTest() {
  const [isChecking, setIsChecking] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const checkConnection = async () => {
    setIsChecking(true);
    setErrorMessage(null);
    
    try {
      // Try to query a simple function to check connection
      const { data, error } = await supabase.from('tenant_profiles').select('count').limit(1).single();
      
      if (error) {
        throw error;
      }
      
      // If we got here, connection is successful
      setConnectionStatus('success');
      toast({
        title: "Connection successful",
        description: "Your application is properly connected to Supabase.",
      });
    } catch (error: any) {
      console.error("Supabase connection error:", error);
      setConnectionStatus('error');
      setErrorMessage(error.message || "Could not connect to Supabase");
      toast({
        title: "Connection failed",
        description: "There was an error connecting to Supabase.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Automatically check connection when component mounts
    checkConnection();
  }, []);

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Supabase Connection Status</CardTitle>
        <CardDescription>
          Verify that your application can connect to Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-lg font-medium">
            Connection Status:
          </div>
          <div className="flex items-center">
            {isChecking ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : connectionStatus === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : connectionStatus === 'error' ? (
              <XCircle className="h-5 w-5 text-red-500" />
            ) : null}
            <span className="ml-2">
              {isChecking ? "Checking..." : 
               connectionStatus === 'success' ? "Connected" : 
               connectionStatus === 'error' ? "Failed" : 
               "Unknown"}
            </span>
          </div>
        </div>
        
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
            {errorMessage}
          </div>
        )}
        
        <div className="flex justify-center pt-2">
          <Button 
            onClick={checkConnection} 
            disabled={isChecking}
          >
            {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Connection Again
          </Button>
        </div>

        <div className="text-sm text-muted-foreground mt-4">
          <p>Connection URL: {supabase.getClientRpcUrl()}</p>
          <p className="text-xs mt-1">
            Project ID: {import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0] || 'lxsuqqlfuftnvuvtctsx'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

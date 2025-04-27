
import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileCode, AlertTriangle } from 'lucide-react';
import LiveSystemVerification from '@/components/LiveSystemVerification';

export default function ConnectionTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">System Connection Test</h1>
      
      <div className="relative">
        <LiveSystemVerification />
        
        <div className="grid gap-6">
          <SupabaseConnectionTest />
          
          <Card>
            <CardContent className="pt-6">
              <Alert className="bg-blue-50 border-blue-200">
                <FileCode className="h-4 w-4 text-blue-600" />
                <AlertTitle>Troubleshooting Information</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">If you're experiencing an infinite recursion error with tenant_user_roles, this is a known issue that requires fixing the RLS policy.</p>
                  <p>The error occurs because the RLS policy is referencing its own table, causing an infinite loop.</p>
                </AlertDescription>
              </Alert>
              
              <Alert className="bg-amber-50 border-amber-200 mt-4">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertTitle>RLS Policy Fix Applied</AlertTitle>
                <AlertDescription>
                  <p>The infinite recursion issue in tenant_user_roles has been fixed by creating a security definer function.</p>
                  <p className="text-sm text-amber-700 mt-1">If you're still seeing issues, try clearing your browser cache or refreshing the page.</p>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

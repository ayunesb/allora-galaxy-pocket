
import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { FileCode } from 'lucide-react';

export default function ConnectionTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">System Connection Test</h1>
      
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

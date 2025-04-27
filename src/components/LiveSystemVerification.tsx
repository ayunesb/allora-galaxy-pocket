
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import SystemHealthCheck from './SystemHealthCheck';

export default function LiveSystemVerification() {
  const [open, setOpen] = useState(false);
  const [showRlsInfo, setShowRlsInfo] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 absolute top-4 right-4"
        >
          <Shield className="h-4 w-4" /> 
          <span className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-green-500" /> System Status
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-center mb-4">Live System Verification</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <SystemHealthCheck />
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowRlsInfo(!showRlsInfo)}
            >
              <AlertTriangle className="h-4 w-4 mr-2" /> 
              RLS Information
            </Button>
            
            {showRlsInfo && (
              <div className="mt-4 p-4 bg-slate-50 rounded-md text-sm">
                <h4 className="font-semibold mb-2">Common RLS Issues:</h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Recursive policies referencing their own table</li>
                  <li>Missing tenant_id column in required tables</li>
                  <li>Incorrect policy expressions</li>
                </ul>
                <p className="mt-2 text-xs text-slate-500">
                  Use security definer functions to avoid recursion issues.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

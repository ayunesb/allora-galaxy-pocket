
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle } from 'lucide-react';
import SystemHealthCheck from './SystemHealthCheck';

export default function LiveSystemVerification() {
  const [open, setOpen] = useState(false);

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
        </div>
      </DialogContent>
    </Dialog>
  );
}

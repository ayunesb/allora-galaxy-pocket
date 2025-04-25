
import React from 'react';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VerificationIndicatorProps {
  phase1Complete: boolean;
  phase2Complete: boolean;
  phase3Complete: boolean;
  moduleName: string;
}

export function VerificationIndicator({
  phase1Complete,
  phase2Complete,
  phase3Complete,
  moduleName
}: VerificationIndicatorProps) {
  const getStatusIcon = (isComplete: boolean, phase: number) => {
    if (isComplete) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <Circle className="h-4 w-4 text-amber-500" />;
    }
  };

  const allComplete = phase1Complete && phase2Complete && phase3Complete;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 p-2 rounded-md ${
            allComplete ? 'bg-green-50' : 'bg-amber-50'
          }`}>
            <div className="flex gap-1">
              {getStatusIcon(phase1Complete, 1)}
              {getStatusIcon(phase2Complete, 2)}
              {getStatusIcon(phase3Complete, 3)}
            </div>
            <span className="text-sm font-medium">
              {moduleName}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="p-2">
            <p className="font-semibold mb-1">Module: {moduleName}</p>
            <ul className="text-xs space-y-1">
              <li className="flex items-center gap-1">
                {phase1Complete ? 
                  <CheckCircle className="h-3 w-3 text-green-500" /> : 
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                }
                Phase 1: {phase1Complete ? 'Complete' : 'Incomplete'} - Fix errors & implement functionality
              </li>
              <li className="flex items-center gap-1">
                {phase2Complete ? 
                  <CheckCircle className="h-3 w-3 text-green-500" /> : 
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                }
                Phase 2: {phase2Complete ? 'Complete' : 'Incomplete'} - Error handling & edge cases
              </li>
              <li className="flex items-center gap-1">
                {phase3Complete ? 
                  <CheckCircle className="h-3 w-3 text-green-500" /> : 
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                }
                Phase 3: {phase3Complete ? 'Complete' : 'Incomplete'} - Role-based testing
              </li>
            </ul>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TransitionErrorHandler } from '@/components/TransitionErrorHandler';
import { LogAlert } from '@/components/ui/LogAlert';
import { UserJourneyTracker } from '@/components/UserJourneyTracker';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface TransitionErrorTesterProps {
  fromStep: string;
  toStep: string;
  currentStep: string;
}

export function TransitionErrorTester({ fromStep, toStep, currentStep }: TransitionErrorTesterProps) {
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const simulateError = () => {
    setHasError(true);
    setIsSuccess(false);
  };
  
  const simulateSuccess = () => {
    setHasError(false);
    setIsSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };
  
  const handleRetry = () => {
    // Simulate a successful retry after error
    setHasError(false);
    setIsSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 3000);
  };
  
  return (
    <div className="space-y-4 border rounded-lg p-4 bg-white dark:bg-gray-800">
      <h3 className="text-lg font-medium">Test Transition: {fromStep} → {toStep}</h3>
      
      <UserJourneyTracker currentStep={currentStep} />
      
      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          onClick={simulateError}
          className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Test Error
        </Button>
        
        <Button 
          variant="outline" 
          onClick={simulateSuccess}
          className="border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Test Success
        </Button>
      </div>
      
      {isSuccess && (
        <LogAlert
          title="Transition Successful"
          description={`Successfully transitioned from ${fromStep} to ${toStep}`}
          severity="info"
          onDismiss={() => setIsSuccess(false)}
        />
      )}
      
      {hasError && (
        <TransitionErrorHandler
          from={fromStep}
          to={toStep}
          onRetry={handleRetry}
          error={new Error(`Simulated error during transition from ${fromStep} to ${toStep}`)}
        >
          <div>This content will be shown when no error is present</div>
        </TransitionErrorHandler>
      )}
    </div>
  );
}


import React from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface JourneyStep {
  name: string;
  path: string;
  completed: boolean;
  current: boolean;
}

interface UserJourneyTrackerProps {
  currentStep: string;
}

export function UserJourneyTracker({ currentStep }: UserJourneyTrackerProps) {
  const isMobile = useIsMobile();
  
  // Define the essential user journey flow
  const journeySteps: JourneyStep[] = [
    { 
      name: 'Authentication', 
      path: '/auth', 
      completed: currentStep !== 'auth', 
      current: currentStep === 'auth' 
    },
    { 
      name: 'Onboarding', 
      path: '/onboarding', 
      completed: ['strategy', 'campaign', 'execution', 'kpi'].includes(currentStep), 
      current: currentStep === 'onboarding' 
    },
    { 
      name: 'Strategy', 
      path: '/strategy', 
      completed: ['campaign', 'execution', 'kpi'].includes(currentStep), 
      current: currentStep === 'strategy' 
    },
    { 
      name: 'Campaign', 
      path: '/campaign', 
      completed: ['execution', 'kpi'].includes(currentStep), 
      current: currentStep === 'campaign' 
    },
    { 
      name: 'Execution', 
      path: '/execution', 
      completed: ['kpi'].includes(currentStep), 
      current: currentStep === 'execution' 
    },
    { 
      name: 'KPI', 
      path: '/kpi', 
      completed: false, 
      current: currentStep === 'kpi' 
    }
  ];

  // For mobile, show only current and adjacent steps to avoid overflow
  const visibleSteps = isMobile 
    ? journeySteps.filter((step, index) => {
        const currentIndex = journeySteps.findIndex(s => s.current);
        return Math.abs(index - currentIndex) <= 1 || index === 0 || index === journeySteps.length - 1;
      })
    : journeySteps;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">User Journey Progress</h3>
      
      <div className="flex flex-wrap items-center gap-2">
        {visibleSteps.map((step, index) => (
          <React.Fragment key={step.name}>
            <div className={`flex items-center rounded-md px-2 py-1 text-xs font-medium ${
              step.current 
                ? 'bg-blue-100 text-blue-700 border border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700' 
                : step.completed 
                  ? 'bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {step.completed ? (
                <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
              ) : step.current ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" aria-hidden="true" />
              ) : null}
              <span>{step.name}</span>
            </div>
            
            {index < visibleSteps.length - 1 && (
              <ArrowRight className="h-3 w-3 text-gray-400 dark:text-gray-500 flex-shrink-0" aria-hidden="true" />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {isMobile && visibleSteps.length < journeySteps.length && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          {journeySteps.findIndex(s => s.current) + 1} of {journeySteps.length} steps
        </div>
      )}
    </div>
  );
}

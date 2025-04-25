
import React from 'react';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

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

  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-700 mb-3">User Journey Progress</h3>
      
      <div className="flex items-center space-x-2">
        {journeySteps.map((step, index) => (
          <React.Fragment key={step.name}>
            <div className={`flex items-center rounded-md px-3 py-1 text-xs font-medium ${
              step.current 
                ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                : step.completed 
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-500'
            }`}>
              {step.completed ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : step.current ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : null}
              {step.name}
            </div>
            
            {index < journeySteps.length - 1 && (
              <ArrowRight className="h-3 w-3 text-gray-400" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

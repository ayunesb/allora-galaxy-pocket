
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { VerificationIndicator } from '@/components/VerificationIndicator';
import { TransitionErrorTester } from '@/components/TransitionErrorTester';
import { useSystemLogsWithFilters } from '@/hooks/useSystemLogsWithFilters';
import RoleGuard from '@/guards/RoleGuard';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react'; // Fix import
import { UserJourneyTracker } from '@/components/UserJourneyTracker'; // Import UserJourneyTracker

export default function JourneyVerificationPage() {
  const { logActivity } = useSystemLogsWithFilters();
  
  // Log page access for audit purposes
  React.useEffect(() => {
    logActivity({
      event_type: 'ADMIN_ACCESS',
      message: 'Admin accessed journey verification page',
      meta: {
        page: 'journey-verification'
      }
    });
  }, [logActivity]);

  return (
    <RoleGuard allowedRoles={['admin', 'developer']}>
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-3xl font-bold mb-6">User Journey Integration Testing</h1>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Testing Environment</AlertTitle>
          <AlertDescription>
            Use this page to test transitions between different stages of the user journey and verify proper error handling.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>User Journey Implementation Status</CardTitle>
            <CardDescription>
              Verify the implementation status of each module in the user journey
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <VerificationIndicator
              phase1Complete={true}
              phase2Complete={true}
              phase3Complete={true}
              moduleName="Authentication"
            />
            <VerificationIndicator
              phase1Complete={true}
              phase2Complete={true}
              phase3Complete={true}
              moduleName="Onboarding"
            />
            <VerificationIndicator
              phase1Complete={true}
              phase2Complete={true}
              phase3Complete={false}
              moduleName="Strategy"
            />
            <VerificationIndicator
              phase1Complete={true}
              phase2Complete={false}
              phase3Complete={false}
              moduleName="Campaign"
            />
            <VerificationIndicator
              phase1Complete={true}
              phase2Complete={false}
              phase3Complete={false}
              moduleName="Execution"
            />
            <VerificationIndicator
              phase1Complete={false}
              phase2Complete={false}
              phase3Complete={false}
              moduleName="KPI"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transition Testing</CardTitle>
            <CardDescription>
              Test transitions between different stages of the user journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <TransitionErrorTester 
              fromStep="Auth" 
              toStep="Onboarding" 
              currentStep="onboarding" 
            />
            <TransitionErrorTester 
              fromStep="Onboarding" 
              toStep="Strategy" 
              currentStep="strategy" 
            />
            <TransitionErrorTester 
              fromStep="Strategy" 
              toStep="Campaign" 
              currentStep="campaign" 
            />
            <TransitionErrorTester 
              fromStep="Campaign" 
              toStep="Execution" 
              currentStep="execution" 
            />
            <TransitionErrorTester 
              fromStep="Execution" 
              toStep="KPI" 
              currentStep="kpi" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mobile Responsiveness Testing</CardTitle>
            <CardDescription>
              Verify that all components render correctly on different screen sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">UserJourneyTracker Component</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Desktop View:</p>
                  <UserJourneyTracker currentStep="onboarding" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Mobile View (Simulated):</p>
                  <div className="max-w-[320px] border border-dashed p-2">
                    <UserJourneyTracker currentStep="onboarding" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}

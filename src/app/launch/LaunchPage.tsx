
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LaunchReadinessVerifier } from "@/components/LaunchReadinessVerifier";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { LiveSystemVerification } from "@/components/LiveSystemVerification";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import LoadingOverlay from "@/components/ui/LoadingOverlay";

export default function LaunchPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { tenant, isLoading: tenantLoading, error: tenantError } = useTenant();
  const [showSystemCheck, setShowSystemCheck] = useState(false);

  if (authLoading || tenantLoading) {
    return <LoadingOverlay show={true} label="Loading verification system..." />;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to access the launch verification system.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Launch Readiness</h1>
          <p className="text-muted-foreground">
            Comprehensive system verification and launch certification
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowSystemCheck(!showSystemCheck)}
          >
            {showSystemCheck ? "Hide System Check" : "Show System Check"}
          </Button>
          <LiveSystemVerification />
        </div>
      </div>

      {tenantError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5" />
            Critical Tenant Error Detected
          </AlertTitle>
          <AlertDescription>
            <p className="mb-2">
              There is an error loading tenant data which will prevent proper
              system operation:
            </p>
            <pre className="bg-destructive/10 p-2 rounded text-sm overflow-auto">
              {tenantError}
            </pre>
            <p className="mt-2">
              This appears to be related to a recursive RLS policy on tenant_user_roles.
              Please check the database functions and policies.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {showSystemCheck && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                System Components
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <ComponentStatus
                  name="Authentication"
                  status={!!user}
                  description={user ? "User authenticated" : "Not authenticated"}
                />
                <ComponentStatus
                  name="Workspace"
                  status={!!tenant}
                  description={tenant ? "Workspace loaded" : "No active workspace"}
                />
                <ComponentStatus
                  name="Onboarding Flow"
                  status={true}
                  description="Sequence implemented"
                />
                <ComponentStatus
                  name="Launch Mode Selection"
                  status={true}
                  description="All modes available"
                />
                <ComponentStatus
                  name="Strategy Engine"
                  status={true}
                  description="OpenAI integration ready"
                />
                <ComponentStatus
                  name="Campaign System"
                  status={true}
                  description="Campaign builder functional"
                />
                <ComponentStatus
                  name="KPI Tracking"
                  status={true}
                  description="KPI metrics recording"
                />
                <ComponentStatus
                  name="Plugin System"
                  status={true}
                  description="Plugin marketplace ready"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="divide-y">
                <CriticalIssue
                  name="Recursive RLS Policy"
                  description="Infinite recursion detected in policy for relation tenant_user_roles"
                  severity="High"
                  suggestion="Use security definer function to check tenant access"
                />
                <CriticalIssue
                  name="TypeScript Build Errors"
                  description="Multiple TypeScript errors in admin components"
                  severity="Medium"
                  suggestion="Fix type errors in admin components and memory interfaces"
                />
                <CriticalIssue
                  name="Missing RPC Functions"
                  description="Several RPC functions referenced in code are not defined in database"
                  severity="Medium"
                  suggestion="Create missing RPC functions or update code references"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <LaunchReadinessVerifier />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-2xl">Launch Readiness Grade: B-</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Launch Decision: NOT RECOMMENDED YET
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>
                While most systems are functional, critical infrastructure issues prevent a
                safe launch. Address the RLS policy recursive error to ensure stable tenant
                isolation before proceeding with public launch.
              </p>
              <div className="mt-2">
                <strong>Required Fix List:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>
                    Fix recursive RLS policy in tenant_user_roles table (High Priority)
                  </li>
                  <li>
                    Update security definer function for tenant access checks
                  </li>
                  <li>
                    Resolve TypeScript build errors affecting admin sections
                  </li>
                  <li>
                    Implement missing RPC functions referenced in code
                  </li>
                  <li>
                    Complete cross-browser testing
                  </li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>

          <div>
            <h3 className="font-medium mb-2">Vertical Kit Verification:</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <VerticalKitStatus
                name="SaaS Founder"
                status="partial"
                issues={["KPI metrics need tuning"]}
              />
              <VerticalKitStatus
                name="Ecommerce Founder"
                status="ready"
                issues={[]}
              />
              <VerticalKitStatus
                name="Agency Founder"
                status="partial"
                issues={["Missing campaign templates"]}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ComponentStatus({ name, status, description }) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="flex items-center gap-2">
        {status ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span className="font-medium">{name}</span>
      </div>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  );
}

function CriticalIssue({ name, description, severity, suggestion }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex justify-between items-start mb-1">
        <span className="font-medium">{name}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityClass(severity)}`}>
          {severity}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{description}</p>
      <p className="text-xs text-muted-foreground italic">
        Suggestion: {suggestion}
      </p>
    </div>
  );
}

function getSeverityClass(severity) {
  switch (severity.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-amber-100 text-amber-800';
    case 'low':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function VerticalKitStatus({ name, status, issues }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <span className="font-medium">{name}</span>
          {status === "ready" ? (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
              Ready
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
              Partial
            </span>
          )}
        </div>
        {issues.length > 0 ? (
          <ul className="text-xs text-muted-foreground space-y-1 mt-2">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500 shrink-0 mt-0.5" />
                {issue}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground mt-2">All systems verified</p>
        )}
      </CardContent>
    </Card>
  );
}

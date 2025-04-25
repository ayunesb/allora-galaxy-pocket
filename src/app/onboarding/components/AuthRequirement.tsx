
import React from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import LiveSystemVerification from "@/components/LiveSystemVerification";
import { useNavigate } from "react-router-dom";

export function AuthRequirement() {
  const navigate = useNavigate();

  return (
    <Card className="w-full max-w-2xl p-6 space-y-6 bg-card dark:bg-gray-800 border border-border dark:border-gray-700 relative">
      <LiveSystemVerification />
      <Alert variant="destructive">
        <AlertTitle>Authentication Required</AlertTitle>
        <AlertDescription>
          Please sign in before continuing with onboarding.
        </AlertDescription>
      </Alert>
      
      <div className="flex flex-col gap-4">
        <Button 
          className="w-full" 
          onClick={() => navigate("/auth/login", { state: { from: "/onboarding" } })}
        >
          Sign In <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <Button 
          variant="outline"
          className="w-full"
          onClick={() => navigate("/auth/signup", { state: { from: "/onboarding" } })}
        >
          Create Account
        </Button>
      </div>
    </Card>
  );
}

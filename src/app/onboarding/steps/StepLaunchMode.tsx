
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import type { OnboardingProfile, LaunchMode } from "@/types/onboarding";

interface StepLaunchModeProps {
  next: (data: Partial<OnboardingProfile>) => void;
  back?: () => void;
  profile: OnboardingProfile;
}

const LAUNCH_MODES: { key: LaunchMode; label: string; desc: string }[] = [
  { 
    key: "ecom", 
    label: "📦 E-Commerce Brand", 
    desc: "Sell products, manage inventory, run ads" 
  },
  { 
    key: "course", 
    label: "🎓 Course Creator", 
    desc: "Sell knowledge with content + email funnels" 
  },
  { 
    key: "agency", 
    label: "💼 Agency or Freelancer", 
    desc: "Deliver services with automations + outreach" 
  },
  { 
    key: "saas", 
    label: "🧠 SaaS Product", 
    desc: "Drive signups, product adoption, MRR growth" 
  }
];

export default function StepLaunchMode({ 
  next, 
  back, 
  profile 
}: StepLaunchModeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>🚀 What Are You Launching?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          We'll customize your AI strategy based on your launch mode.
        </p>

        <div className="space-y-3">
          {LAUNCH_MODES.map((mode) => (
            <Button 
              key={mode.key}
              variant="outline" 
              className="w-full flex flex-col items-start h-auto p-4 space-y-1"
              onClick={() => next({ launch_mode: mode.key })}
            >
              <span className="font-semibold">{mode.label}</span>
              <span className="text-xs text-muted-foreground">
                {mode.desc}
              </span>
            </Button>
          ))}
        </div>

        {back && (
          <div className="mt-4">
            <Button 
              variant="ghost" 
              onClick={back}
              className="w-full"
            >
              Back
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

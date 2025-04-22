
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingProfile } from "@/types/onboarding";

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  profile: OnboardingProfile;
};

export default function Step1Company({ next, profile }: Props) {
  const [companyName, setCompanyName] = React.useState(profile.companyName || "");
  const [website, setWebsite] = React.useState(profile.website || "");
  const [touched, setTouched] = React.useState(false);

  const handleNext = () => {
    setTouched(true);
    if (companyName.trim()) {
      next({ companyName, website });
    }
  };

  const showError = touched && !companyName.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Tell us about your company</h2>
        <p className="text-sm text-muted-foreground">Let's start with the basics</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Your company name"
            aria-required
            required
            aria-invalid={showError}
          />
          {showError && (
            <span className="text-xs text-destructive">Company name is required.</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website (optional)</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} disabled={!companyName.trim()}>Next</Button>
      </div>
    </div>
  );
}

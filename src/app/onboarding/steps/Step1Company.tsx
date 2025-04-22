
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingProfile } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

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
    <StepTemplate
      title="Tell us about your company"
      description="Let's start with the basics"
      showBack={false}
      onNext={handleNext}
      nextDisabled={!companyName.trim()}
    >
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
    </StepTemplate>
  );
}

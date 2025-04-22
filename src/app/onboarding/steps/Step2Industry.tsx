
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OnboardingProfile, Industry } from "@/types/onboarding";
import StepTemplate from "./StepTemplate";

const industries: { value: Industry; label: string }[] = [
  { value: "tech", label: "Technology" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail" },
  { value: "other", label: "Other" },
];

type Props = {
  next: (data: Partial<OnboardingProfile>) => void;
  back: () => void;
  profile: OnboardingProfile;
};

export default function Step2Industry({ next, back, profile }: Props) {
  const [selected, setSelected] = React.useState<Industry | undefined>(
    profile.industry
  );

  const handleNext = () => {
    if (selected) {
      next({ industry: selected });
    }
  };

  return (
    <StepTemplate
      title="Select your industry"
      showBack
      onBack={back}
      onNext={handleNext}
      nextDisabled={!selected}
    >
      <Select
        value={selected}
        onValueChange={(value) => setSelected(value as Industry)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Choose an industry" />
        </SelectTrigger>
        <SelectContent>
          {industries.map((industry) => (
            <SelectItem key={industry.value} value={industry.value}>
              {industry.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </StepTemplate>
  );
}
